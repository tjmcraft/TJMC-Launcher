const LoggerUtil                             = require('../util/loggerutil')
const request                                = require('request')
const fs                                     = require('fs')
const path                                   = require('path')
const crypto                                 = require('crypto')
const os                                     = require('os')
const Zip                                    = require('adm-zip')
const { merge }                              = require('../util/Tools')
const logg                                   = LoggerUtil('%c[MinecraftCore]', 'color: #be1600; font-weight: bold')

class Minecraft {

    /**
     * This is just constructor of class
     * @param client U may set here "this"
     */
    constructor(client) {
        this.client = client;
        this.options = client.options;
        this.baseRequest = request.defaults({
            pool: { maxSockets: this.options.overrides.request.maxSockets ?? 4 },
            timeout: this.options.overrides.request.timeout ?? 10000
        });
        this.overrides = {
            javaSep: process.platform === 'win32' ? ';' : ':',
            resolution: {
                width: this.options.installation?.resolution?.width ?? this.options.minecraft?.launch?.width ?? 854,
                height: this.options.installation?.resolution?.height ?? this.options.minecraft?.launch?.height ?? 480
            },
            version: {
                id: this.options.installation.lastVersionId,
                type: this.options.installation.type
            },
            checkHash: this.options.installation?.checkHash ?? this.options.overrides?.checkHash ?? true
        };
    }

    /**
     * Loads main client jar
     * @param version Main version JSON
     */
    async loadClient(version) {
        const versionPath = path.join(this.options.overrides.path.version);
        logg.debug(`<- Attempting to load ${this.overrides.version.id}.jar`);
        await this.downloadAsync(version.downloads.client.url, versionPath, `${this.overrides.version.id}.jar`, true, 'version-jar');
        logg.debug(`-> Loaded ${this.overrides.version.id}.jar`);
        return path.join(versionPath, `${this.overrides.version.id}.jar`);
    }

    /**
     * Collect cp of libraries
     * @param {Object} classJson - version JSON
     */
    async getClasses (classJson) {
        const libraryDirectory = path.resolve(path.join(this.options.overrides.path.root, 'libraries'));
        if (classJson.mavenFiles) await this.downloadLibrary(libraryDirectory, classJson.mavenFiles, 'classes-maven');
        const parsed = classJson.libraries.map(lib => {
            const lib_url_ex = (lib.url != undefined || lib.artifact != undefined || lib.downloads?.artifact != undefined || lib.exact_url != undefined);
            const lib_no_clfs_ex = (!lib_url_ex && (lib.classifiers == undefined && lib.downloads?.classifiers == undefined) && lib.name);
            const lib_ex = (lib_url_ex || lib_no_clfs_ex) && !this.parseRule(lib);
            if (lib_ex) return lib;
        }).filter(lib => Boolean(lib));
        const libs = await this.downloadLibrary(libraryDirectory, parsed, 'classes');
        logg.log(`Collected Class Path's! (count: ${libs.length})`);
        return libs;
    }

    popString (path) {
        const tempArray = path.split('/')
        tempArray.pop()
        return tempArray.join('/')
    }

    /**
     * Function get and download natives
     * @param version Main version JSON
     */
    async getNatives(version) {
        let count = 0;
        const nativeDirectory = path.resolve(path.join(this.options.overrides.path.version, 'natives'))
        logg.debug(`Set natives directory to ${nativeDirectory}`)
        if (!fs.existsSync(nativeDirectory) || !fs.readdirSync(nativeDirectory).length) {
            fs.mkdirSync(nativeDirectory, { recursive: true })
            const natives = async () => {
                const natives = []
                await Promise.all(version.libraries.map(async (lib) => {
                    if (!(lib.classifiers || (lib.downloads ? lib.downloads.classifiers : false))) return
                    if (this.parseRule(lib)) return
                    const lib_clfs = lib.classifiers || lib.downloads.classifiers || null;
                    const native =
                        this.getOS() === 'osx'
                        ? (lib_clfs['natives-osx'] || lib_clfs['natives-macos'])
                        : (lib_clfs[`natives-${this.getOS()}`])
                    natives.push(native)
                }))
                return natives
            }
            const stat = await natives()
            this.client.emit('progress', {
                type: 'natives',
                task: 0,
                total: stat.length,
            })
            let promise_counter = 0;
            await Promise.all(stat.map(async (native) => {
                if (!native) return
                const name = native.path.split('/').pop()
                const native_path = path.join(nativeDirectory, name);
                if (!fs.existsSync(native_path) || (this.overrides.checkHash && !await this.checkSum(native.sha1, native_path))) {
                    (promise_counter <= 0) && logg.debug(`Downloading natives...`); promise_counter++;
                    await this.downloadAsync(native.url, nativeDirectory, name, true, 'natives');
                }
                try {
                    new Zip(native_path).extractAllTo(nativeDirectory, true);
                } catch (e) { logg.warn(e) }
                fs.unlinkSync(native_path);
                count++;
                this.client.emit('progress', {
                    type: 'natives',
                    task: count,
                    total: stat.length,
                });
            }))
            logg.debug(`Downloaded and extracted natives! ${stat.length}`);
            count = 0;
            this.client.emit('progress', {
                type: 'natives',
                task: count,
                total: stat.length,
            });
        }
        logg.debug(`Natives Collected!`);
        return nativeDirectory;
    }

    /**
     * Function getting and download assets
     * @param version Main version JSON
     */
    async getAssets(version) {
        let count = 0;
        const assetDirectory = path.resolve(path.join(this.options.overrides.path.root, 'assets'))
        if (!fs.existsSync(path.join(assetDirectory, 'indexes', `${version.assetIndex.id}.json`))) {
            await this.downloadAsync(version.assetIndex.url, path.join(assetDirectory, 'indexes'), `${version.assetIndex.id}.json`, true, 'asset-json')
        }
        const assets_pathes = []
        const index = JSON.parse(fs.readFileSync(path.join(assetDirectory, 'indexes', `${version.assetIndex.id}.json`), { encoding: 'utf8' }))
        const res_url = "https://resources.download.minecraft.net"
        this.client.emit('progress', {
            type: 'assets',
            task: 0,
            total: Object.keys(index.objects).length,
        })
        let promise_counter = 0;
        await Promise.all(Object.keys(index.objects).map(async (asset, number) => {
            const hash = index.objects[asset].hash
            const subhash = hash.substring(0, 2)
            const subAsset = path.join(assetDirectory, 'objects', subhash)
            assets_pathes.push(path.join(subAsset, hash))
            if (!fs.existsSync(path.join(subAsset, hash)) || (this.overrides.checkHash && !await this.checkSum(hash, path.join(subAsset, hash)))) {
                (promise_counter <= 0) && logg.debug(`Downloading assets...`); promise_counter++;
                await this.downloadAsync(`${res_url}/${subhash}/${hash}`, subAsset, hash, true, 'assets');
            }
            count++
            this.client.emit('progress', {
                type: 'assets',
                task: count,
                total: Object.keys(index.objects).length,
            })
        }))
        count = 0
        this.client.emit('progress', {
            type: 'assets',
            task: count,
            total: Object.keys(index.objects).length,
        })
        logg.debug('Collected assets')
        return assets_pathes
    }

    /**
     * Download library to directory
     * @param {String} directory - directory
     * @param {Array.<Object>} libraries - libraries array
     * @param {String} type - Meta library type
     */
    async downloadLibrary(directory, libraries, type = 'classes') {
        let count = 0;
        const libs = await Promise.all(libraries.map(async library => {
            if (!library) return false;

            const lib = library.name.split(':');
            const jarPath = path.join(directory, `${lib[0].replace(/\./g, '/')}/${lib[1]}/${lib[2]}`);
            const name = `${lib[1]}-${lib[2]}${lib[3] ? '-' + lib[3] : ''}.jar`;

            if (!fs.existsSync(path.join(jarPath, name))) {
                const lib_url = library.downloads?.artifact?.url?.includes('http') ? library.downloads.artifact.url :
                    library.artifact?.url.includes('http') ? library.artifact.url :
                        library.url ? library.url :
                            library.exact_url ? library.exact_url : "";
                const jar_name = `${lib[0].replace(/\./g, '/')}/${lib[1]}/${lib[2]}/${name}`;
                const urls = [
                    lib_url,
                    'https://libraries.minecraft.net/' + jar_name,
                    'https://tlauncherrepo.com/repo/libraries/' + jar_name,
                    'https://files.minecraftforge.net/maven/' + jar_name,
                    'http://dl.liteloader.com/versions/' + jar_name,
                    'https://repo1.maven.org/maven2/' + jar_name,
                    'https://maven.minecraftforge.net/' + jar_name,
                    (library.url ? library.url : '') + jar_name
                ];
                for (const url of urls) {
                    if (await this.downloadAsync(url, jarPath, name, true, type)) { break; };
                }
            }

            count++;

            this.client.emit('progress', {
                type: type,
                task: count,
                total: libraries.length,
            });

            if (library.mod || library.downloadOnly) return false;

            return (`${jarPath}${path.sep}${name}`);
        }));

        count = 0;

        this.client.emit('progress', {
            type: type,
            task: count,
            total: libraries.length,
        });

        return libs.filter(lib => Boolean(lib));
    }

    /**
     * TODO: Move to "got" lib
     * Download file asynchronous to directory
     * @param {String} url - URL to download
     * @param {String} directory - Directory to download
     * @param {String} filename - Filename to download
     * @param {Boolean} retry - Try again?
     * @param {String} type - Meta type of download
     */
    downloadAsync(url, directory, filename, retry, type = null) {
        return new Promise((resolve) => {

            const filepath = path.join(directory, filename);

            if (fs.existsSync(filepath) && fs.readFileSync(filepath).length > 0) return resolve(false);
            if (!url.includes('http')) return resolve(false);

            const _request = this.baseRequest(url);

            let receivedBytes = 0;
            let totalBytes = 0;

            fs.mkdirSync(directory, { recursive: true });

            const runRetry = async (e) => {
                logg.debug(`[FILE] Failed to download ${url} to ${filepath} due to\n${e}.` + ` Retrying... ${retry}`);
                if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
                if (retry) return resolve(await this.downloadAsync(url, directory, filename, false, type));
                resolve(false);
            };

            _request.on('response', (data) => {

                if (data.statusCode !== 200) {
                    logg.warn(`[REQUEST] Failed to download ${url} due to: error (${data.statusCode})...`)
                    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
                    resolve(false);
                    return;
                }

                totalBytes = parseInt(data.headers['content-length']);

                const file = fs.createWriteStream(filepath, { flags: 'w+' });

                _request.pipe(file);

                file.once('finish', () => {
                    this.client.emit('download-status', {
                        name: filename,
                        type: type,
                        current: 0,
                        total: totalBytes,
                    });
                    resolve(true);
                })

                file.on('error', (e) => runRetry(e));

            });

            _request.on('error', (e) => runRetry(e));

            _request.on('data', (data) => {
                receivedBytes += data.length;
                this.client.emit('download-status', {
                    name: filename,
                    type: type,
                    current: receivedBytes,
                    total: totalBytes,
                })
            });

        })
    }

    /**
     * Check sha1 file hash
     * @param {String} file_hash - file hash
     * @param {String} file - file path
     */
    checkSum = (file_hash, file) => new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha1');
        fs.createReadStream(file).on('data', data => hash.update(data)).on('end', () => resolve(file_hash === hash.digest('hex')));
    })


    /**
     * Parse rule for library
     * @param lib - Library to check
     * @returns {Boolean} - allow or disallow rule is
     */
    parseRule (lib) {
        if (lib.rules) {
            if (lib.rules.length > 1) {
                if (lib.rules[0].action === 'allow' &&
                    lib.rules[1].action === 'disallow' &&
                    lib.rules[1].os.name === 'osx') {
                    return this.getOS() === 'osx'
                } else {
                    return true
                }
            } else {
                if (lib.rules[0].action === 'allow' && lib.rules[0].os) return lib.rules[0].os.name !== this.getOS()
            }
        } else { return false }
    }

    /**
     * Returns memory arguments for JVM process.
     */
    getMemory () {
        if (!this.options.java.memory) {
            logg.debug('Memory not set! Setting 1GB as MAX!')
            this.options.java.memory = {
                min: 512,
                max: 1024
            }
        }
        if (!isNaN(this.options.java.memory.max) && !isNaN(this.options.java.memory.min)) {
            if (this.options.java.memory.max < this.options.java.memory.min) {
                logg.debug('MIN memory is higher then MAX! Resetting!')
                this.options.java.memory.max = 1024
                this.options.java.memory.min = 512
            }
            return [`${this.options.java.memory.max}M`, `${this.options.java.memory.min}M`]
        }
    }

    /**
     * Construct the argument array that will be passed to the JVM process.
     */
    constructJVMArguments(versionFile, tempNativePath, cp) {
        const assetRoot = path.resolve(path.join(this.options.overrides.path.root, 'assets'))
        const assetPath = path.join(assetRoot)
        const jar = this.overrides.javaSep + this.options.mcPath;
        this.fields = {
            '${auth_access_token}': this.options.auth.access_token || this.options.auth.uuid,
            '${auth_session}': this.options.auth.access_token || this.options.auth.uuid,
            '${auth_player_name}': this.options.auth.username,
            '${auth_uuid}': this.options.auth.uuid,
            '${auth_xuid}': this.options.auth.uuid,
            '${user_properties}': this.options.auth.user_properties || `{}`,
            '${user_type}': 'mojang',
            '${version_name}': this.overrides.version.id,
            '${assets_index_name}': versionFile.assetIndex.id,
            '${game_directory}': this.options.overrides.path?.gameDirectory,
            '${assets_root}': assetPath,
            '${game_assets}': assetPath,
            '${version_type}': this.overrides.version.type,
            '${clientid}': this.options.auth.access_token,
            '${resolution_width}': this.overrides.resolution.width,
            '${resolution_height}': this.overrides.resolution.height,
            '${classpath}': `${cp.join(this.overrides.javaSep) + jar}`,
            '${natives_directory}': tempNativePath,
            '${game_libraries_directory}': this.options.overrides.path.directory,
            '${launcher_name}': 'TJMC',
            '${launcher_version}': '1.0.0'
        }
        if(versionFile.arguments){
            return this.getJVMArgs113(versionFile, tempNativePath, cp)
        } else {
            return this.getJVMArgs112(versionFile, tempNativePath, cp)
        }
    }

    /**
     * Construct the argument array that will be passed to the JVM process.
     * This function is for 1.12 and below.
     */
    getJVMArgs112(versionFile, tempNativePath, cp){

        let args = []
        const jar = (this.overrides.javaSep) + this.options.mcPath;

        // Java Arguments
        if(process.platform === 'darwin'){
            args.push('-Xdock:name=TJMC-Launcher')
            args.push('-Xdock:icon=' + path.join(__dirname, 'assets', 'minecraft.icns'))
        }
        args.push('-Xmx' + this.getMemory()[0])
        args.push('-Xms' + this.getMemory()[1])
        args.push('-Djava.library.path=' + tempNativePath)

        // Classpath Argument
        args.push('-cp')
        args.push(`${cp.join(this.overrides.javaSep) + jar}`)

        // Main Java Class
        args.push(versionFile.mainClass)

        // Forge Arguments
        args = args.concat(this.resolveArgs(versionFile))

        return args
    }

    /**
     * Construct the argument array that will be passed to the JVM process.
     * This function is for 1.13+
     *
     * Note: Required Libs https://github.com/MinecraftForge/MinecraftForge/blob/af98088d04186452cb364280340124dfd4766a5c/src/fmllauncher/java/net/minecraftforge/fml/loading/LibraryFinder.java#L82
     *
     */
    getJVMArgs113(versionFile){

        let args = []

        if(process.platform === 'darwin'){
            args.push('-Xdock:name=TJMC-Launcher')
            args.push('-Xdock:icon=' + path.join(__dirname, 'assets', 'minecraft.icns'))
        }
        args.push('-Xmx' + this.getMemory()[0])
        args.push('-Xms' + this.getMemory()[1])
        args = args.concat(versionFile.arguments.jvm)

        // Main Java Class
        args.push(versionFile.mainClass)

        // Vanilla Arguments
        args = args.concat(versionFile.arguments.game)

        for(let i=0; i<args.length; i++){
            if(typeof args[i] === 'object' && args[i].rules != null){
                let checksum = 0
                for(let rule of args[i].rules){
                    if(rule.os != null){
                        if(rule.os.name === this.getOS()
                            && (rule.os.version == null || new RegExp(rule.os.version).test(os.release))){
                            if(rule.action === 'allow'){
                                checksum++
                            }
                        } else {
                            if(rule.action === 'disallow'){
                                checksum++
                            }
                        }
                    } else if(rule.features != null){
                        // We don't have many 'features' in the index at the moment.
                        // This should be fine for a while.
                        if(rule.features.has_custom_resolution != null && rule.features.has_custom_resolution === true){
                            if(this.options.minecraft.launch.fullscreen){
                                args[i].value = [
                                    '--fullscreen',
                                    'true'
                                ]
                            }
                            checksum++
                        }
                    }
                }

                // TODO splice not push
                if(checksum === args[i].rules.length){
                    if(typeof args[i].value === 'string'){
                        args[i] = args[i].value
                    } else if(typeof args[i].value === 'object'){
                        //args = args.concat(args[i].value)
                        args.splice(i, 1, ...args[i].value)
                    }
                    // Decrement i to reprocess the resolved value
                    i--
                } else {
                    args[i] = null
                }

            } else if(typeof args[i] === 'string' && !(args[i] === undefined)){
                for (let ob of Object.keys(this.fields)) {
                    if (args[i].includes(ob)) {
                        args[i] = args[i].replace(ob, this.fields[ob])
                    }
                }
            } else if (typeof args[i] === 'object' && !args[i].rules) {
                if(typeof args[i].value === 'string'){
                    args[i] = args[i].value
                } else if(typeof args[i].value === 'object'){
                    //args = args.concat(args[i].value)
                    args.splice(i, 1, ...args[i].value)
                }
            } else {
                args[i] = null
            }
        }

        // Filter null values
        args = args.filter(arg => {
            return arg != null
        })

        return args
    }

    /**
     * Resolve the arguments
     *
     * @returns {Array.<string>} An array containing the arguments
     */
    resolveArgs(versionFile){

        const mcArgs = versionFile.minecraftArguments.split(' ')

        // Replace the declared variables with their proper values.
        for (let i = 0; i < mcArgs.length; i++) {
            if (Object.keys(this.fields).includes(mcArgs[i])) {
                mcArgs[i] = this.fields[mcArgs[i]]
            }
        }

        // Prepare game resolution
        if(this.options.minecraft.launch.fullscreen){
            mcArgs.push('--fullscreen')
            mcArgs.push(true)
        } else {
            mcArgs.push('--width')
            mcArgs.push(this.overrides.resolution.width)
            mcArgs.push('--height')
            mcArgs.push(this.overrides.resolution.height)
        }

        return mcArgs
    }

    getOS() {
        switch (process.platform) {
            case 'win32': return 'windows'
            case 'darwin': return 'osx'
            case 'linux': return 'linux'
            default: return 'unknown_os'
        }
    }

}

module.exports = Minecraft
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const os = require('os')
const Zip = require('adm-zip')
const EventEmitter = require('events')
const { downloadToFile } = require('../util/download')
const logg = require('../util/loggerutil')('%c[MinecraftCore]', 'color: #be1600; font-weight: bold')

class Minecraft extends EventEmitter {

    /**
     * @typedef MinecraftOptions
     * @type {object}
     * @property {object} overrides - Object that describes overrides
     * @property {object} overrides.path - Object that describes all path overrides
     * @property {string} overrides.path.versions - Path to version directory (where main jar located)
     * @property {string} overrides.path.minecraft - Path to minecraft (root) directory
     * @property {string} overrides.path.gameDirectory - Path to game directory
     * @property {string} mcPath - Path to main jar
     * @property {string} java.javaPath - Path to java executable
     * @property {object} installation - Installation object
     * @property {boolean} installation.checkHash - Installation check hash
     * @property {object} installation.resolution - Installation resolution object
     * @property {string | number} installation.resolution.width - Installation width
     * @property {string | number} installation.resolution.height - Installation height
     * @property {boolean} installation.resolution.fullscreen - Installation fullscreen mode
     * @property {string} installation.lastVersionId - ID of current version
     * @property {string} installation.type - Type of current version
     * @property {object} java - Minecraft java options
     * @property {object} java.memory - Minecraft java memory options
     * @property {number} java.memory.min - Minecraft minimum java memory
     * @property {number} java.memory.max - Minecraft maximum java memory
     * @property {object} auth - Minecraft auth
     * @property {object} auth.access_token - Minecraft auth token
     * @property {object} auth.uuid - Minecraft auth uuid (offline)
     * @property {object} auth.username - Minecraft auth username
     * @property {object} auth.user_properties - Minecraft auth user properties
     */

    /**
     * @type {MinecraftOptions}
     */
    options = {};

    /**
     * Minecraft constructor
     * @param {MinecraftOptions} options - Options to construct the launcher
     */
    constructor(options) {
        super();

        this.debug = false;
        this.options = options;
        this.overrides = {
            javaSep: process.platform === 'win32' ? ';' : ':',
            resolution: {
                width: this.options.installation.resolution.width ?? 854,
                height: this.options.installation.resolution.height ?? 480,
                fullscreen: this.options.installation.resolution.fullscreen ?? false,
            },
            version: {
                id: this.options.installation.lastVersionId,
                type: this.options.installation.type,
            },
            checkHash: this.options.installation.checkHash != void 0 ? this.options.installation.checkHash : true,
        };
    }

    /**
     * Loads main client jar
     * @param version Main version JSON
     */
    async loadClient(version) {
        this.debug && logg.debug(`<- Attempting to load ${path.basename(this.options.mcPath)}`);
        const handleProgress = ({ percent }) => {
            this.emit('progress', {
                type: 'load:version-jar',
                task: percent,
                total: 1,
            });
        }
        if (!fs.existsSync(this.options.mcPath) || (this.overrides.checkHash && !await this.checkSum(version.downloads.client.sha1, this.options.mcPath))) {
            await downloadToFile(version.downloads.client.url, this.options.mcPath, true, handleProgress);
        }
        this.debug && logg.debug(`-> Loaded ${path.basename(this.options.mcPath)}`);
        return this.options.mcPath;
    }

    /**
     * Collect cp of libraries
     * @param {Object} classJson - version JSON
     */
    async getClasses(classJson) {
        const libraryDirectory = path.join(this.options.overrides.path.minecraft, 'libraries');
        if (classJson.mavenFiles) await this.downloadLibrary(libraryDirectory, classJson.mavenFiles, 'classes-maven');
        const parsed = classJson.libraries.filter(lib => {
            const lib_url_ex = (lib.url != undefined || lib.artifact != undefined || lib.downloads?.artifact != undefined || lib.exact_url != undefined);
            const lib_no_clfs_ex = (!lib_url_ex && (lib.classifiers == undefined && lib.downloads?.classifiers == undefined) && lib.name);
            const lib_ex = (lib_url_ex || lib_no_clfs_ex) && !this.parseRule(lib);
            if (lib_ex) return lib;
        });
        const libs = await this.downloadLibrary(libraryDirectory, parsed, 'classes');
        this.debug && logg.log(`Collected Class Path's! (count: ${libs.length})`);
        return libs;
    }

    popString(path) {
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
        this.debug && logg.debug(`Set natives directory to ${nativeDirectory}`)
        if (!fs.existsSync(nativeDirectory) || !fs.readdirSync(nativeDirectory).length) {
            fs.mkdirSync(nativeDirectory, { recursive: true });

            const stat = version.libraries
                .filter(lib => {
                    if ((lib.classifiers || (lib.downloads ? lib.downloads.classifiers : false)) && !this.parseRule(lib)) return lib;
                }).map((lib) => {
                    const lib_clfs = lib.classifiers || lib.downloads.classifiers || {};
                    const native =
                        this.getOS() === 'osx'
                            ? (lib_clfs['natives-osx'] || lib_clfs['natives-macos'])
                            : (lib_clfs[`natives-${this.getOS()}`])
                    return native;
                });

            this.emit('progress', {
                type: 'natives',
                task: 0,
                total: stat.length,
            });
            await Promise.all(stat.map(async (native, index) => {
                if (!native) return
                const name = native.path.split('/').pop()
                const native_path = path.join(nativeDirectory, name);
                if (!fs.existsSync(native_path) || (this.overrides.checkHash && !await this.checkSum(native.sha1, native_path))) {
                    (index <= 0) && this.debug && logg.debug(`Downloading natives...`);
                    await downloadToFile(native.url, native_path, true);
                }
                try {
                    new Zip(native_path).extractAllTo(nativeDirectory, true);
                } catch (e) { this.debug && logg.warn(e) }
                fs.unlinkSync(native_path);
                count++;
                this.emit('progress', {
                    type: 'natives',
                    task: count,
                    total: stat.length,
                });
            }));
            this.debug && logg.debug(`Downloaded and extracted natives! ${stat.length}`);
        }
        this.debug && logg.debug(`Natives Collected!`);
        return nativeDirectory;
    }

    /**
     * Function getting and download assets
     * @param version Main version JSON
     */
    async getAssets(version) {
        let count = 0;
        const assetDirectory = path.resolve(path.join(this.options.overrides.path.minecraft, 'assets'))
        if (!fs.existsSync(path.join(assetDirectory, 'indexes', `${version.assetIndex.id}.json`))) {
            await downloadToFile(version.assetIndex.url, path.join(assetDirectory, 'indexes', `${version.assetIndex.id}.json`), true);
        }
        const index = JSON.parse(fs.readFileSync(path.join(assetDirectory, 'indexes', `${version.assetIndex.id}.json`), { encoding: 'utf8' }));
        const res_url = "https://resources.download.minecraft.net";
        this.emit('progress', {
            type: 'assets',
            task: 0.0001,
            total: Object.keys(index.objects).length,
        });

        const assetsToLoad = [];
        const assetProcessor = async (asset, number) => {
            const hash = index.objects[asset].hash;
            const subHash = hash.substring(0, 2);
            const subAsset = path.join(assetDirectory, 'objects', subHash);
            const assetPath = path.join(subAsset, hash);
            if (!fs.existsSync(assetPath) || (this.overrides.checkHash && !await this.checkSum(hash, assetPath))) {
                (number <= 0) && this.debug && logg.debug(`Downloading assets...`);
                assetsToLoad.push(async () => {
                    await downloadToFile(`${res_url}/${subHash}/${hash}`, assetPath, true);
                    count++;
                    this.emit('progress', {
                        type: 'assets',
                        task: count,
                        total: Object.keys(index.objects).length,
                    });
                });
            } else {
                count++;
                this.emit('progress', {
                    type: 'assets',
                    task: count,
                    total: Object.keys(index.objects).length,
                })
            }
            return assetPath;
        };
        if (this.overrides.checkHash) {
            for (const number in Object.keys(index.objects)) {
                const asset = Object.keys(index.objects)[number];
                await assetProcessor(asset, number);
            }
        } else {
            await Promise.all(Object.keys(index.objects).map((asset, number) => assetProcessor(asset, number)));
        }
        if (assetsToLoad.length > 0) {
            await Promise.all(assetsToLoad.map(async asset => await asset()));
        }
        this.debug && logg.debug('Collected assets');
    }

    /**
     * Download library to directory
     * @param {String} directory - directory
     * @param {Array.<Object>} libraries - libraries array
     * @param {String} type - Meta library type
     */
    async downloadLibrary(directory, libraries, type = 'classes') {
        let totalProgress = 0;
        const useProgressCounter = () => {
          let prev = 0;
          return ({ percent }) => {
            totalProgress += percent - prev;
            this.emit('progress', {
                type: type,
                task: totalProgress,
                total: libraries.length,
            });
            prev = percent;
          }
        }
        const isValidUrl = (url) => url != void 0 && ['http', '.jar'].every(e => url.includes(e));
        const libs = await Promise.all(libraries.map(async library => {
            if (!library) return false;

            const handleProgress = useProgressCounter();

            const lib = library.name.split(':');
            const jarPath = path.join(directory, `${lib[0].replace(/\./g, '/')}/${lib[1]}/${lib[2]}`);
            const name = `${lib[1]}-${lib[2]}${lib[3] ? '-' + lib[3] : ''}.jar`;
            const jarFile = path.join(jarPath, name);
            this.debug && logg.debug(">>", "load", name);

            const hash = library.downloads?.artifact?.sha1 || library?.checksum || library?.artifact?.sha1 || undefined;

            if (!fs.existsSync(jarFile) || (this.overrides.checkHash && hash != void 0 && !await this.checkSum(hash, jarFile))) {
                // logg.debug("<<", "download", name);
                const lib_url = ((library) => {
                    if (isValidUrl(library.downloads?.artifact?.url))
                        return library.downloads.artifact.url;
                    if (isValidUrl(library.artifact?.url))
                        return library.artifact.url;
                    if (isValidUrl(library.url))
                        return library.url;
                    if (isValidUrl(library.exact_url))
                        return library.exact_url;
                    return "";
                })(library);
                const jar_name = `${lib[0].replace(/\./g, '/')}/${lib[1]}/${lib[2]}/${name}`;
                const urls = [
                    lib_url,
                    'https://libraries.minecraft.net/' + jar_name,
                    'https://tlauncherrepo.com/repo/libraries/' + jar_name,
                    'https://files.minecraftforge.net/maven/' + jar_name,
                    'http://dl.liteloader.com/versions/' + jar_name,
                    'https://repo1.maven.org/maven2/' + jar_name,
                    'https://maven.minecraftforge.net/' + jar_name,
                    'https://search.maven.org/remotecontent?filepath=' + jar_name,
                    (library.url ? library.url : '') + jar_name
                ];
                for (const url of urls) {
                    const loaded = await downloadToFile(url, jarFile, true, handleProgress);
                    // logg.debug(">>", "downloaded", name);
                    if (loaded) break;
                }
            } else {
                handleProgress({ percent: 1 });
            }

            if (library.mod || library.downloadOnly) return false;

            return (`${jarPath}${path.sep}${name}`);
        }));

        return libs.filter(lib => Boolean(lib));
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
    parseRule(lib) {
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
    getMemory() {
        if (!this.options.java.memory) {
            this.debug && logg.debug('Memory not set! Setting 1GB as MAX!')
            this.options.java.memory = {
                min: 512,
                max: 1024
            }
        }
        if (!isNaN(this.options.java.memory.max) && !isNaN(this.options.java.memory.min)) {
            if (this.options.java.memory.max < this.options.java.memory.min) {
                this.debug && logg.debug('MIN memory is higher then MAX! Resetting!')
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
        const assetRoot = path.resolve(path.join(this.options.overrides.path.minecraft, 'assets'))
        const assetPath = path.join(assetRoot)
        const jar = this.overrides.javaSep + this.options.mcPath;
        this.fields = {
            '${auth_access_token}': this.options.auth.access_token || this.options.auth.uuid,
            '${auth_session}': this.options.auth.access_token || this.options.auth.uuid,
            '${auth_player_name}': this.options.auth.username,
            '${auth_uuid}': this.options.auth.uuid,
            '${auth_xuid}': this.options.auth.uuid,
            '${user_properties}': JSON.stringify(this.options.auth.user_properties) || `{}`,
            '${user_type}': 'mojang',
            '${version_name}': this.overrides.version.id,
            '${assets_index_name}': versionFile.assetIndex.id,
            '${game_directory}': this.options.overrides.path.gameDirectory,
            '${assets_root}': assetPath,
            '${game_assets}': assetPath,
            '${version_type}': this.overrides.version.type,
            '${clientid}': this.options.auth.access_token,
            '${resolution_width}': this.overrides.resolution.width,
            '${resolution_height}': this.overrides.resolution.height,
            '${classpath}': `${cp.join(this.overrides.javaSep) + jar}`,
            '${natives_directory}': tempNativePath,
            '${game_libraries_directory}': this.options.overrides.path.versions,
            '${launcher_name}': 'TJMC',
            '${launcher_version}': '1.0.0'
        }
        if (versionFile.arguments) {
            return this.getJVMArgs113(versionFile, tempNativePath, cp)
        } else {
            return this.getJVMArgs112(versionFile, tempNativePath, cp)
        }
    }

    /**
     * Construct the argument array that will be passed to the JVM process.
     * This function is for 1.12 and below.
     */
    getJVMArgs112(versionFile, tempNativePath, cp) {

        let args = []
        const jar = (this.overrides.javaSep) + this.options.mcPath;

        // Java Arguments
        if (process.platform === 'darwin') {
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
    getJVMArgs113(versionFile) {

        let args = []

        if (process.platform === 'darwin') {
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

        for (let i = 0; i < args.length; i++) {
            if (typeof args[i] === 'object' && args[i].rules != null) {
                let checksum = 0
                for (let rule of args[i].rules) {
                    if (rule.os != null) {
                        if (rule.os.name === this.getOS()
                            && (rule.os.version == null || new RegExp(rule.os.version).test(os.release))) {
                            if (rule.action === 'allow') {
                                checksum++
                            }
                        } else {
                            if (rule.action === 'disallow') {
                                checksum++
                            }
                        }
                    } else if (rule.features != null) {
                        // We don't have many 'features' in the index at the moment.
                        // This should be fine for a while.
                        if (rule.features.has_custom_resolution != null && rule.features.has_custom_resolution === true) {
                            if (this.overrides.resolution.fullscreen) {
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
                if (checksum === args[i].rules.length) {
                    if (typeof args[i].value === 'string') {
                        args[i] = args[i].value
                    } else if (typeof args[i].value === 'object') {
                        //args = args.concat(args[i].value)
                        args.splice(i, 1, ...args[i].value)
                    }
                    // Decrement i to reprocess the resolved value
                    i--
                } else {
                    args[i] = null
                }

            } else if (typeof args[i] === 'string' && !(args[i] === undefined)) {
                for (let ob of Object.keys(this.fields)) {
                    if (args[i].includes(ob)) {
                        args[i] = args[i].replace(ob, this.fields[ob])
                    }
                }
            } else if (typeof args[i] === 'object' && !args[i].rules) {
                if (typeof args[i].value === 'string') {
                    args[i] = args[i].value
                } else if (typeof args[i].value === 'object') {
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
    resolveArgs(versionFile) {

        const mcArgs = versionFile.minecraftArguments.split(' ')

        // Replace the declared variables with their proper values.
        for (let i = 0; i < mcArgs.length; i++) {
            if (Object.keys(this.fields).includes(mcArgs[i])) {
                mcArgs[i] = this.fields[mcArgs[i]]
            }
        }

        // Prepare game resolution
        if (this.overrides.resolution.fullscreen) {
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

    /**
     * Get current platform
     * @returns {'windows' | 'osx' | 'linux' | undefined}
     */
    getOS() {
        switch (process.platform) {
            case 'win32': return 'windows'
            case 'darwin': return 'osx'
            case 'linux': return 'linux'
            default: return undefined
        }
    }

}

module.exports = Minecraft
const child = require('child_process')
const request                                = require('request')
const fs                                     = require('fs')
const path                                   = require('path')
const checksum                               = require('checksum')
const Zip = require('adm-zip')
const logg = LoggerUtil('%c[MinecraftCore]', 'color: #be1600; font-weight: bold')

let counter = 0

class Minecraft{
    /**
     * This is just constructor
     * @param client U may set here this
     */
    constructor (client) {
        this.client = client
        this.options = client.options
        this.baseRequest = request.defaults({
            pool: { maxSockets: this.options.request.maxSockets || 4 },
            timeout: this.options.request.timeout || 10000
        })
    }

    /**
     * Function checks if current Java version works
     * @param {string} java java executable or path to java
     */
    async checkJava (java) {
        return new Promise(resolve => {
            child.exec(`"${java}" -version`, (error, stdout, stderr) => {
                if (error) {
                    resolve({run: false,message: error})
                } else {
                    logg.debug(`Using Java version ${stderr.match(/"(.*?)"/).pop()} ${stderr.includes('64-Bit') ? '64-Bit' : '32-Bit'}`)
                    resolve({run: true})
                }
            })
        })
    }

    /**
     * Function return current os name
     */
    getOS () {
        if (this.options.os) {
            return this.options.os
        } else {
            switch (process.platform) {
                case 'win32': return 'windows'
                case 'darwin': return 'osx'
                default: return 'linux'
            }
        }
    }

    static get getVersionManifest () {
        return new Promise(resolve => {
            this.getMVM.then(m => {
                this.getTVM.then(t => {
                    return resolve(arrayDeDuplicate(m.versions,t.versions))
                })
            })
        })
    }
    static get getMVM (){
        return new Promise(resolve => {
            request.get(`https://launchermeta.mojang.com/mc/game/version_manifest.json`, (error, response, body) => {
                if (error) resolve(error)
                const parsed = JSON.parse(body)
                return resolve(parsed)
            })
        })
    }
    static get getTVM (){
        return new Promise(resolve => {
            request.get(`http://u.tlauncher.ru/repo/versions/versions.json`, (error, response, body) => {
                if (error) resolve(error)
                const parsed = JSON.parse(body)
                return resolve(parsed)
            })
        })
    }

    /**
     * Function just download a single file and return its body
     * @param url give url of file
     */
    downloadFile(url) {
        return new Promise((resolve, reject) => {
            request(url, (error, response, body) => {
                if (error) reject(error);
                if (response.statusCode != 200) {
                    reject('Invalid status code <' + response.statusCode + '>');
                }
                resolve(body);
            });
        });
    }

    /**
     * Gets Main JSON of given version
     * @param version Version of Minecraft
     */
    async getVersion (version) {
        logg.debug('Loading Version JSON for: '+version)
        const versionJsonPath = path.join(this.options.path.directory, version, `${version}.json`)
        var c_version = null;
        if (fs.existsSync(versionJsonPath)) {
            c_version = JSON.parse(fs.readFileSync(versionJsonPath)) 
        } else {
            const parsed = await this.constructor.getVersionManifest
            for (const cv in parsed) {
                if (parsed[cv].id === version) {
                        const body = await this.downloadFile(parsed[cv].url || `http://u.tlauncher.ru/repo/versions/${version}.json`)
                        c_version = JSON.parse(body)
                }
            }
        }
        if (c_version.inheritsFrom) {
            const inherit = await this.getVersion(c_version.inheritsFrom)
            c_version.libraries = arrayDeDuplicate(c_version.libraries, inherit.libraries)
            c_version.mainClass = c_version.mainClass ?? inherit.mainClass
            c_version.minecraftArguments = c_version.minecraftArguments ?? inherit.minecraftArguments
            c_version.assetIndex = c_version.assetIndex ?? inherit.assetIndex
            c_version.downloads = c_version.downloads ?? inherit.downloads
            if (c_version.arguments || inherit.arguments){
                c_version.arguments.game = c_version.arguments.game && inherit.arguments.game ? arrayDeDuplicate(c_version.arguments.game, inherit.arguments.game) : c_version.arguments.game ?? inherit.arguments.game
                c_version.arguments.jvm = c_version.arguments.jvm && inherit.arguments.jvm ? arrayDeDuplicate(c_version.arguments.jvm, inherit.arguments.jvm) : c_version.arguments.jvm ?? inherit.arguments.jvm
            }
            delete c_version.inheritsFrom
        }
        fs.mkdirSync(path.join(this.options.path.directory, version), {recursive: true})
        fs.writeFileSync(versionJsonPath, JSON.stringify(c_version))
        return c_version
    }

    /**
     * Function downloads main jar 
     * @param version Main version JSON
     */
    async getJar (version) {
        const versionPath = path.join(this.options.path.version)
        await this.downloadAsync(version.downloads.client.url, versionPath, `${this.options.version.number}.jar`, true, 'version-jar')
        logg.debug('Downloaded version jar')
    }

    /**
     * Function creates classpathes to libraries
     * @param classJson Main version JSON
     */
    async getClasses (classJson) {
        let libs = []

        const libraryDirectory = path.resolve(path.join(this.options.path.root, 'libraries'))

        if (classJson.mavenFiles) {
            await this.downloadToDirectory(libraryDirectory, classJson.mavenFiles, 'classes-maven-custom')
        }

        const parsed = classJson.libraries.map(lib => {
            if (lib.url || lib.artifact || lib.downloads.artifact && !this.parseRule(lib)) return lib
        })

        libs = arrayDeDuplicate(await this.downloadToDirectory(libraryDirectory, parsed, 'classes'))
        counter = 0

        logg.debug('Collected class paths')
        return libs
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
    async getNatives (version) {
        const nativeDirectory = path.resolve(path.join(this.options.path.version, 'natives'))

        if (!fs.existsSync(nativeDirectory) || !fs.readdirSync(nativeDirectory).length) {
            fs.mkdirSync(nativeDirectory, { recursive: true })

            const natives = async () => {
                const natives = []
                await Promise.all(version.libraries.map(async (lib) => {
                    if (!(lib.classifiers || (lib.downloads ? lib.downloads.classifiers : false))) return
                    if (this.parseRule(lib)) return

                    const native = 
                    lib.classifiers ? (
                        this.getOS() === 'osx' 
                        ? (lib.classifiers['natives-osx'] || lib.classifiers['natives-macos']) 
                        : (lib.classifiers[`natives-${this.getOS()}`]) 
                    ) : lib.downloads.classifiers ? (
                        this.getOS() === 'osx' 
                        ? (lib.downloads.classifiers['natives-osx'] || lib.downloads.classifiers['natives-macos']) 
                        : (lib.downloads.classifiers[`natives-${this.getOS()}`]) 
                    ) : null
                    //natives = arrayDeDuplicate(natives, native)
                    natives.push(native)
                }))
                return natives
            }
            const stat = await natives()

            this.client.emit('progress', {
                type: 'natives',
                task: 0,
                total: stat.length
            })

            await Promise.all(stat.map(async (native) => {
                if (!native) return
                const name = native.path.split('/').pop()
                await this.downloadAsync(native.url, nativeDirectory, name, true, 'natives')
                if (!await this.checkSum(native.sha1, path.join(nativeDirectory, name))) {
                    await this.downloadAsync(native.url, nativeDirectory, name, true, 'natives')
                }
                try {
                    new Zip(path.join(nativeDirectory, name)).extractAllTo(nativeDirectory, true)
                } catch (e) {
                    // Only doing a console.warn since a stupid error happens. You can basically ignore this.
                    // if it says Invalid file name, just means two files were downloaded and both were deleted.
                    // All is well.
                    console.warn(e)
                }
                fs.unlinkSync(path.join(nativeDirectory, name))
                counter++
                this.client.emit('progress', {
                    type: 'natives',
                    task: counter,
                    total: stat.length
                })
            }))
            logg.debug('Downloaded and extracted natives')
        }

        counter = 0
        logg.debug(`Set native path to ${nativeDirectory}`)

        return nativeDirectory
    }

    /**
     * Function getting and download assets
     * @param version Main version JSON
     */
    async getAssets (version) {
        const assetDirectory = path.resolve(path.join(this.options.path.root, 'assets'))
        if (!fs.existsSync(path.join(assetDirectory, 'indexes', `${version.assetIndex.id}.json`))) {
            await this.downloadAsync(version.assetIndex.url, path.join(assetDirectory, 'indexes'), `${version.assetIndex.id}.json`, true, 'asset-json')
        }
    
        const index = JSON.parse(fs.readFileSync(path.join(assetDirectory, 'indexes', `${version.assetIndex.id}.json`), { encoding: 'utf8' }))
    
        this.client.emit('progress', {
            type: 'assets',
            task: 0,
            total: Object.keys(index.objects).length
        })
    
        await Promise.all(Object.keys(index.objects).map(async asset => {
            const hash = index.objects[asset].hash
            const subhash = hash.substring(0, 2)
            const subAsset = path.join(assetDirectory, 'objects', subhash)
    
            if (!fs.existsSync(path.join(subAsset, hash)) || !await this.checkSum(hash, path.join(subAsset, hash))) {
                await this.downloadAsync(`${this.options.url.resource}/${subhash}/${hash}`, subAsset, hash, true, 'assets')
                counter++
                this.client.emit('progress', {
                    type: 'assets',
                    task: counter,
                    total: Object.keys(index.objects).length
                })
            }
        }))
        counter = 0
    
        logg.debug('Downloaded assets')
    }

    /**
     * Function download libraries
     * @param directory 
     * @param libraries 
     * @param eventName 
     */
    async downloadToDirectory (directory, libraries, eventName) {
        const libs = []

        await Promise.all(libraries.map(async library => {
            if (!library) return
            
            const lib = library.name.split(':')

            let jarPath
            let name

            /*if (library.downloads && library.downloads.artifact || library.artifact && library.downloads.artifact.path || library.artifact.path) {
                name = library.downloads.artifact.path.split('/')[library.downloads.artifact.path.split('/').length - 1]
                jarPath = path.join(directory, this.popString(library.downloads.artifact.path))
            } else {*/
                name = `${lib[1]}-${lib[2]}${lib[3] ? '-' + lib[3] : ''}.jar`
                jarPath = path.join(directory, `${lib[0].replace(/\./g, '/')}/${lib[1]}/${lib[2]}`)
            //}

            if (!fs.existsSync(path.join(jarPath, name))) {
                if (library.downloads && library.downloads.artifact && library.downloads.artifact.url.includes('http')) {
                    await this.downloadAsync(library.downloads.artifact.url, jarPath, name, true, eventName)
                } else if (library.artifact && library.artifact.url.includes('http')) {
                    await this.downloadAsync(library.artifact.url, jarPath, name, true, eventName)
                } else {
                    const jar_name = `${lib[0].replace(/\./g, '/')}/${lib[1]}/${lib[2]}/${name}`
                    const url = [
                        library.url ? library.url : '',
                        'https://libraries.minecraft.net/' + jar_name, 
                        'https://tlauncherrepo.com/repo/libraries/' + jar_name, 
                        'https://files.minecraftforge.net/maven/' + jar_name, 
                        'http://dl.liteloader.com/versions/' + jar_name, 
                        'https://repo1.maven.org/maven2/' + jar_name, 
                        (library.url ? library.url : '') + jar_name
                    ]
                    for (let c of url){
                        if(await this.downloadAsync(c, jarPath, name, true, eventName)) {continue}
                    }
                }
            }

            counter++

            this.client.emit('progress', {
                type: eventName,
                task: counter,
                total: libraries.length
            })

            if (library.mod || library.downloadOnly) return 
            
            libs.push(`${jarPath}${path.sep}${name}`)
        }))
        counter = 0

        return libs
    }

    /**
     * Function download file async
     * @param url URL to download
     * @param directory Directory to download
     * @param name FileName to download
     * @param retry Try again?
     * @param type Type of download
     */
    downloadAsync (url, directory, name, retry, type) {
        if (fs.existsSync(path.join(directory, name)) && fs.readFileSync(path.join(directory, name)).length > 0) return new Promise(resolve => {return resolve(false)})
        if (url.includes('http')) {
            return new Promise(resolve => {
                fs.mkdirSync(directory, { recursive: true })

                const _request = this.baseRequest(url)

                let receivedBytes = 0
                let totalBytes = 0

                _request.on('response', (data) => {
                    if (data.statusCode !== 200) {
                        logg.debug(`Failed to download ${url} due to: File not found...`)
                        if (fs.existsSync(path.join(directory, name))) fs.unlinkSync(path.join(directory, name))
                        resolve(false)
                    }
                    totalBytes = parseInt(data.headers['content-length'])
                })

                _request.on('error', async (error) => {
                    logg.debug(`Failed to download asset to ${path.join(directory, name)} due to\n${error}.`+` Retrying... ${retry}`)
                    if (retry) await this.downloadAsync(url, directory, name, false, type)
                    if (fs.existsSync(path.join(directory, name))) fs.unlinkSync(path.join(directory, name))
                    resolve()
                })

                _request.on('data', (data) => {
                    receivedBytes += data.length
                    this.client.emit('download-status', {
                        name: name,
                        type: type,
                        current: receivedBytes,
                        total: totalBytes
                    })
                })

                const file = fs.createWriteStream(path.join(directory, name))
                _request.pipe(file)

                file.once('finish', () => {
                    this.client.emit('download', name)
                    resolve({failed: false,asset: null})
                })

                file.on('error', async (e) => {
                    logg.debug(`Failed to download asset to ${path.join(directory, name)} due to\n${e}.`+` Retrying... ${retry}`)
                    if (fs.existsSync(path.join(directory, name))) fs.unlinkSync(path.join(directory, name))
                    if (retry) await this.downloadAsync(url, directory, name, false, type)
                    resolve()
                })
            })
        }
    }

    /**
     * Function checks file hash
     * @param hash given hash
     * @param file file
     */
    checkSum (hash, file) {
        return new Promise((resolve, reject) => {
            checksum.file(file, (err, sum) => {
            if (err) {
                logg.debug(`Failed to check file hash due to ${err}`)
                resolve(false)
            } else {
                resolve(hash === sum)
            }
            })
        })
    }

    /**
     * Function checks rules of lib
     * @param lib Library to check
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
            if (lib.rules[0].action === 'allow' && lib.rules[0].os) return this.getOS() !== 'osx'
            }
        } else {
            return false
        }
    }

    async getLaunchOptions (json) {
        
        let args = json.minecraftArguments ? json.minecraftArguments.split(' ') : json.arguments.game
        const assetRoot = path.resolve(path.join(this.options.path.root, 'assets'))
        const assetPath = path.join(assetRoot)

        //const minArgs = 5
        //if (args.length < minArgs) args = args.concat(json.minecraftArguments ? json.minecraftArguments.split(' ') : json.arguments.game)

        const fields = {
            '${auth_access_token}': this.options.authorization.access_token,
            '${auth_session}': this.options.authorization.access_token,
            '${auth_player_name}': this.options.authorization.name,
            '${auth_uuid}': this.options.authorization.uuid,
            '${user_properties}': this.options.authorization.user_properties,
            '${user_type}': 'mojang',
            '${version_name}': this.options.version.number,
            '${assets_index_name}': json.assetIndex.id,
            '${game_directory}': this.options.path.gameDirectory || this.options.path.root,
            '${assets_root}': assetPath,
            '${game_assets}': assetPath,
            '${version_type}': this.options.version.type,
            '${resolution_width}': this.options.launch.width,
            '${resolution_height}': this.options.launch.height
        }

        for (let i = 0; i < args.length; i++){
            if (typeof args[i] === 'object') {
                if (args[i].value && args[i].rules){
                    args[i] = ""
                } else if (Array.isArray(args[i])) {
                    args[i] = ""
                }else {
                    args.splice(i, 2)
                }
            }
        }

        for (let index = 0; index < args.length; index++) {
            if (Object.keys(fields).includes(args[index])) {
                args[index] = fields[args[index]]
            }
        }

        if (this.options.window) {
            this.options.window.fullscreen
            ? args.push('--fullscreen')
            : args.push('--width', this.options.launch.width, '--height', this.options.launch.height)
        }
        if (this.options.server) args.push('--server', this.options.server.host, '--port', this.options.server.port || '25565')
        if (this.options.proxy) {
            args.push(
            '--proxyHost',
            this.options.proxy.host,
            '--proxyPort',
            this.options.proxy.port || '8080',
            '--proxyUser',
            this.options.proxy.username,
            '--proxyPass',
            this.options.proxy.password
            )
        }
        //if (this.options.customLaunchArgs) args = args.concat(this.options.customLaunchArgs)
        logg.debug('Set launch options')
        return args
    }

    getMemory () {
        if (!this.options.memory) {
            logg.debug('Memory not set! Setting 1GB as MAX!')
            this.options.memory = {
            min: 512,
            max: 1023
            }
        }
        if (!isNaN(this.options.memory.max) && !isNaN(this.options.memory.min)) {
            if (this.options.memory.max < this.options.memory.min) {
            logg.debug('MIN memory is higher then MAX! Resetting!')
            this.options.memory.max = 1023
            this.options.memory.min = 512
            }
            return [`${this.options.memory.max}M`, `${this.options.memory.min}M`]
        } else { return [`${this.options.memory.max}`, `${this.options.memory.min}`] }
    }

}

module.exports = Minecraft

/**
* This function merging only arrays unique values. It does not merges arrays in to array with duplicate values at any stage.
*
* @params ...args Function accept multiple array input (merges them to single array with no duplicates)
* it also can be used to filter duplicates in single array
*/
function arrayDeDuplicate(...args){
    let set = new Set();
    for(let arr of args){
       arr.map((value) => {
          set.add(value);
       });
    }
    return [...set];
}
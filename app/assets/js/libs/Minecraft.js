const child = require('child_process')
const LoggerUtil                             = require('../loggerutil')
const request                                = require('request')
const fs                                     = require('fs')
const path                                   = require('path')
const checksum                               = require('checksum')
const os = require('os')
const Zip = require('adm-zip')
const logg = LoggerUtil('%c[MinecraftCore]', 'color: #be1600; font-weight: bold')

let counter = 0

class Minecraft {
    /**
     * This is just constructor
     * @param client U may set here this
     */
    constructor (client) {
        this.client = client
        this.options = client.options
        this.baseRequest = request.defaults({
            pool: { maxSockets: this.options.overrides.request.maxSockets || 4 },
            timeout: this.options.overrides.request.timeout || 10000
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
     * Function downloads main jar 
     * @param version Main version JSON
     */
    async getJar (version) {
        const versionPath = path.join(this.options.overrides.path.version)
        await this.downloadAsync(version.downloads.client.url, versionPath, `${this.options.version.id}.jar`, true, 'version-jar')
        logg.debug('Downloaded version jar')
        return path.join(versionPath, `${this.options.version.id}.jar`)
    }

    /**
     * Function creates classpathes to libraries
     * @param classJson Main version JSON
     */
    async getClasses (classJson) {
        let libs = []

        const libraryDirectory = path.resolve(path.join(this.options.overrides.path.root, 'libraries'))

        if (classJson.mavenFiles) {
            await this.downloadToDirectory(libraryDirectory, classJson.mavenFiles, 'classes-maven-custom')
        }

        const parsed = classJson.libraries.map(lib => {
            if (lib.url || lib.artifact || lib.downloads.artifact && !this.parseRule(lib)) return lib
        })

        libs = merge(await this.downloadToDirectory(libraryDirectory, parsed, 'classes'))
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
        const nativeDirectory = path.resolve(path.join(this.options.overrides.path.version, 'natives'))

        if (!fs.existsSync(nativeDirectory) || !fs.readdirSync(nativeDirectory).length) {
            fs.mkdirSync(nativeDirectory, { recursive: true })

            const natives = async () => {
                const natives = []
                await Promise.all(version.libraries.map(async (lib) => {
                    if (!(lib.classifiers || (lib.downloads ? lib.downloads.classifiers : false))) return
                    if (this.parseRule(lib)) return

                    const native = 
                    lib.classifiers ? (
                        API.getOS() === 'osx' 
                        ? (lib.classifiers['natives-osx'] || lib.classifiers['natives-macos']) 
                        : (lib.classifiers[`natives-${API.getOS()}`]) 
                    ) : lib.downloads.classifiers ? (
                        API.getOS() === 'osx' 
                        ? (lib.downloads.classifiers['natives-osx'] || lib.downloads.classifiers['natives-macos']) 
                        : (lib.downloads.classifiers[`natives-${API.getOS()}`]) 
                    ) : null
                    //natives = merge(natives, native)
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
        this.client.emit('progress', {
            type: 'natives',
            task: counter,
            total: 1
        })

        logg.debug(`Set native path to ${nativeDirectory}`)

        return nativeDirectory
    }

    /**
     * Function getting and download assets
     * @param version Main version JSON
     */
    async getAssets (version) {
        const assetDirectory = path.resolve(path.join(this.options.overrides.path.root, 'assets'))
        if (!fs.existsSync(path.join(assetDirectory, 'indexes', `${version.assetIndex.id}.json`))) {
            await this.downloadAsync(version.assetIndex.url, path.join(assetDirectory, 'indexes'), `${version.assetIndex.id}.json`, true, 'asset-json')
        }
    
        const index = JSON.parse(fs.readFileSync(path.join(assetDirectory, 'indexes', `${version.assetIndex.id}.json`), { encoding: 'utf8' }))
        const res_url = "https://resources.download.minecraft.net"
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
                await this.downloadAsync(`${res_url}/${subhash}/${hash}`, subAsset, hash, true, 'assets')
                counter++
                this.client.emit('progress', {
                    type: 'assets',
                    task: counter,
                    total: Object.keys(index.objects).length
                })
            }
        }))

        counter = 0
        this.client.emit('progress', {
            type: 'assets',
            task: counter,
            total: Object.keys(index.objects).length
        })
    
        logg.debug('Downloaded assets')

        return
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
        this.client.emit('progress', {
            type: eventName,
            task: counter,
            total: libraries.length
        })

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
                    this.client.emit('download-status', {
                        name: name,
                        type: type,
                        current: 0,
                        total: totalBytes
                    })
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
                return API.getOS() === 'osx'
            } else {
                return true
            }
            } else {
            if (lib.rules[0].action === 'allow' && lib.rules[0].os) return API.getOS() !== 'osx'
            }
        } else {
            return false
        }
    }

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
     * 
     */
    constructJVMArguments(versionFile, tempNativePath, cp){
        const assetRoot = path.resolve(path.join(this.options.overrides.path.root, 'assets'))
        const assetPath = path.join(assetRoot)
        const jar = (process.platform === 'win32' ? ';' : ':') + (fs.existsSync(this.options.mcPath) ? `${this.options.mcPath}` : `${path.join(this.options.overrides.path.version, `${this.options.version.id}.jar`)}`)
        this.fields = {
            '${auth_access_token}': this.options.auth.access_token,
            '${auth_session}': this.options.auth.access_token,
            '${auth_player_name}': this.options.auth.username,
            '${auth_uuid}': this.options.auth.uuid,
            '${user_properties}': this.options.auth.user_properties,
            '${user_type}': 'mojang',
            '${version_name}': this.options.version.id,
            '${assets_index_name}': versionFile.assetIndex.id,
            '${game_directory}': this.options.overrides.path.gameDirectory || this.options.overrides.path.root,
            '${assets_root}': assetPath,
            '${game_assets}': assetPath,
            '${version_type}': this.options.version.type,
            '${resolution_width}': this.options.minecraft.launch.width,
            '${resolution_height}': this.options.minecraft.launch.height,
            '${classpath}': `${cp.join(process.platform === 'win32' ? ';' : ':')}${jar}`,
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
        const jar = (process.platform === 'win32' ? ';' : ':') + (fs.existsSync(this.options.mcPath) ? `${this.options.mcPath}` : `${path.join(this.options.overrides.path.version, `${this.options.version.id}.jar`)}`)

        // Java Arguments
        if(process.platform === 'darwin'){
            args.push('-Xdock:name=TJMC')
            args.push('-Xdock:icon=' + path.join(__dirname, '..', 'images', 'minecraft.icns'))
        }
        args.push('-Xmx' + this.getMemory()[0])
        args.push('-Xms' + this.getMemory()[1])
        args.push('-Djava.library.path=' + tempNativePath)

        // Classpath Argument
        args.push('-cp')
        args.push(`${cp.join(process.platform === 'win32' ? ';' : ':')}${jar}`)

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
            args.push('-Xdock:name=TJMC')
            args.push('-Xdock:icon=' + path.join(__dirname, '..', 'images', 'minecraft.icns'))
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
                        if(rule.os.name === API.getOS()
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
        for(let i=0; i<mcArgs.length; ++i){
            for (let i = 0; i < mcArgs.length; i++) {
                if (Object.keys(this.fields).includes(mcArgs[i])) {
                    mcArgs[i] = this.fields[mcArgs[i]]
                }
            }
        }

        // Prepare game resolution
        if(this.options.minecraft.launch.fullscreen){
            mcArgs.push('--fullscreen')
            mcArgs.push(true)
        } else {
            mcArgs.push('--width')
            mcArgs.push(this.options.minecraft.launch.width)
            mcArgs.push('--height')
            mcArgs.push(this.options.minecraft.launch.height)
        }

        return mcArgs
    }

}

module.exports = Minecraft
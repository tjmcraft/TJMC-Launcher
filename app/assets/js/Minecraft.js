const child = require('child_process')
const request                                = require('request')
const fs                                     = require('fs')
const path                                   = require('path')
const logg = LoggerUtil('%c[Minecraft Core]', 'color: #be1600; font-weight: bold')
class Minecraft {
    constructor () {
        this.options = {
            javaPath: 'java',
            path: {
                root: path.join(this.constructor.getAppData, 'minecraft'),
                version: path.join(this.constructor.getAppData, 'minecraft', 'versions')
            },
            url: {
                resource: "https://resources.download.minecraft.net"
            }
        }
    }
    static get getAppData(){
        return path.normalize((process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share"))+'/TJMC-Launcher') || require('electron').remote.app.getPath('userData')
    }

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

    async construct () {
        const java = await this.checkJava(this.options.javaPath || 'java')
        if (!java.run) {
            logg.debug(`Couldn't start Minecraft due to: ${java.message}`)
            return null
        }
        if (!fs.existsSync(this.options.path.root)) {
            logg.debug('Attempting to create root folder')
            fs.mkdirSync(this.options.path.root)
        }
        if (this.options.path.gameDirectory) {
            this.options.path.gameDirectory = path.resolve(this.options.path.gameDirectory)
            if (!fs.existsSync(this.options.path.gameDirectory)) {
              fs.mkdirSync(this.options.path.gameDirectory, { recursive: true })
            }
        }
        const directory = this.options.path.version || path.join(this.options.path.root, 'versions', this.options.version.number)
        this.options.path.version = directory

        const versionFile = await this.getVersion(this.options.version.number)
        /*const mcPath = this.options.overrides.minecraftJar || (this.options.version.custom
          ? path.join(this.options.root, 'versions', this.options.version.custom, `${this.options.version.custom}.jar`)
          : path.join(directory, `${this.options.version.number}.jar`))
        this.options.mcPath = mcPath
        const nativePath = await this.handler.getNatives()
    
        if (!fs.existsSync(mcPath)) {
          logg.debug('Attempting to download Minecraft version jar')
          await this.handler.getJar()
        }*/
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
        logg.log('Loading Version JSON for: '+version)
        const versionJsonPath = path.join(this.options.path.version, version, `${version}.json`)
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
            c_version.arguments.game = c_version.arguments.game && inherit.arguments.game ? arrayDeDuplicate(Array(c_version.arguments.game), Array(inherit.arguments.game)) : c_version.arguments.game ?? inherit.arguments.game
            c_version.arguments.jvm = c_version.arguments.jvm && inherit.arguments.jvm ? arrayDeDuplicate(Array(c_version.arguments.jvm), Array(inherit.arguments.jvm)) : c_version.arguments.jvm ?? inherit.arguments.jvm
            delete c_version.inheritsFrom
        }
        fs.mkdirSync(this.options.path.root, {recursive: true})
        fs.writeFileSync(versionJsonPath, JSON.stringify(c_version))
        return c_version
    }

    downloadAsync (url, directory, name, retry, type) {
        return new Promise(resolve => {
        fs.mkdirSync(directory, { recursive: true })

        const _request = this.baseRequest(url)

        let receivedBytes = 0
        let totalBytes = 0

        _request.on('response', (data) => {
            if (data.statusCode === 404) {
            this.client.emit('debug', `[MCLC]: Failed to download ${url} due to: File not found...`)
            resolve(false)
            }

            totalBytes = parseInt(data.headers['content-length'])
        })

        _request.on('error', async (error) => {
            this.client.emit('debug', `[MCLC]: Failed to download asset to ${path.join(directory, name)} due to\n${error}.` +
                        ` Retrying... ${retry}`)
            if (retry) await this.downloadAsync(url, directory, name, false, type)
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
            resolve({
            failed: false,
            asset: null
            })
        })

        file.on('error', async (e) => {
            this.client.emit('debug', `[MCLC]: Failed to download asset to ${path.join(directory, name)} due to\n${e}.` +
                        ` Retrying... ${retry}`)
            if (fs.existsSync(path.join(directory, name))) fs.unlinkSync(path.join(directory, name))
            if (retry) await this.downloadAsync(url, directory, name, false, type)
            resolve()
        })
        })
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
const child = require('child_process')
const request                                = require('request')
const fs                                     = require('fs')
const path                                   = require('path')
const logg = LoggerUtil('%c[Minecraft Core]', 'color: #be1600; font-weight: bold')
class Minecraft {
    constructor () {
        this.options = {
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
                    logg.log(`Using Java version ${stderr.match(/"(.*?)"/).pop()} ${stderr.includes('64-Bit') ? '64-Bit' : '32-Bit'}`)
                    resolve({run: true})
                }
            })
        })
    }

    construct () {
        this.getVersion('1.15.2').then(json => {
            
        })
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
        fs.mkdir(path.dirname(versionJsonPath), { recursive: true }, (err) => {
            if (err) throw err;
            fs.writeFileSync(versionJsonPath, JSON.stringify(c_version))
        })
        return c_version
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
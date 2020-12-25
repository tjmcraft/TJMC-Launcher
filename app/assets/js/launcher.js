const child = require('child_process')
const EventEmitter = require('events').EventEmitter
const request                                = require('request')
const fs                                     = require('fs')
const path                                   = require('path')
const Minecraft                              = require('./Minecraft')
const logg = LoggerUtil('%c[Launcher]', 'color: #16be00; font-weight: bold')

class launcher extends EventEmitter{
    static get getAppData(){
        return path.normalize((process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share"))+'/TJMC-Launcher') || require('electron').remote.app.getPath('userData')
    }
    async construct () {
        this.options = {
            javaPath: 'java',
            os: null,
            version: {
                number: '1.12.2'
            },
            request: {
                maxSockets: 32,
                timeout: 5000
            },
            path: {
                root: path.join(this.constructor.getAppData, 'minecraft'),
                version: path.join(this.constructor.getAppData, 'minecraft', 'versions'),
                directory: path.join(this.constructor.getAppData, 'minecraft', 'versions')
            },
            url: {
                resource: "https://resources.download.minecraft.net"
            }
        }
        this.handler = new Minecraft(this)
        const java = await this.handler.checkJava(this.options.javaPath || 'java')
        if (!java.run) {
            logg.warn(`Couldn't start Minecraft due to: ${java.message}`)
            return null
        }
        if (!fs.existsSync(this.options.path.root)) {
            logg.log('Attempting to create root folder')
            fs.mkdirSync(this.options.path.root)
        }
        if (this.options.path.gameDirectory) {
            this.options.path.gameDirectory = path.resolve(this.options.path.gameDirectory)
            if (!fs.existsSync(this.options.path.gameDirectory)) {
              fs.mkdirSync(this.options.path.gameDirectory, { recursive: true })
            }
        }
        this.options.path.version = path.join(this.options.path.root, 'versions', this.options.version.number)

        const versionFile = await this.handler.getVersion(this.options.version.number)
        this.options.mcPath = path.join(this.options.path.version, `${this.options.version.number}.jar`)
        
        const nativePath = await this.handler.getNatives(versionFile)
        if (!fs.existsSync(this.options.mcPath)) {
          logg.log('Attempting to download Minecraft version jar')
          await this.handler.getJar(versionFile)
        }

        const classes = arrayDeDuplicate(await this.handler.getClasses(versionFile))
        //logg.debug(classes)

        logg.log('Attempting to download assets')
        await this.handler.getAssets(versionFile)

        logg.log('nice')
    }
}

module.exports = launcher


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
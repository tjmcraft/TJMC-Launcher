const child = require('child_process')
const EventEmitter = require('events').EventEmitter
const LoggerUtil                             = require('./loggerutil')
const request                                = require('request')
const fs                                     = require('fs')
const path                                   = require('path')
const Minecraft              = require('./Minecraft')
const {merge} = require('./Tools')
const logg = LoggerUtil('%c[Launcher]', 'color: #16be00; font-weight: bold')

class launcher extends EventEmitter{
    static get getAppData(){
        return path.normalize((process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share"))+'/TJMC-Launcher') || require('electron').remote.app.getPath('userData')
    }
    static openMineDir(){
        logg.debug('Using default path: '+this.getAppData)
        switch (getOS()) {
            case 'windows': 
                child.exec(`explorer "${this.getAppData}"`)
                break
            case 'osx':
                child.exec(`open "" "${this.getAppData}"`)
                break
            default:
                break
        }
        return
    }
    async construct (options) {
        this.options = options
        this.options.overrides.path.version = path.join(this.options.overrides.path.root, 'versions', this.options.version.number)
        logg.debug(`Minecraft folder ${this.options.overrides.path.root}`)

        this.handler = new Minecraft(this)

        const java = await this.handler.checkJava(this.options.java.javaPath || 'java')
        if (!java.run) {
            logg.error(`Couldn't start Minecraft due to: ${java.message}`)
            return null
        }
        if (!fs.existsSync(this.options.overrides.path.root)) {
            logg.log('Attempting to create root folder')
            fs.mkdirSync(this.options.overrides.path.root, {recursive: true})
        }
        if (this.options.overrides.path.gameDirectory) {
            this.options.overrides.path.gameDirectory = path.resolve(this.options.overrides.path.gameDirectory)
            if (!fs.existsSync(this.options.overrides.path.gameDirectory)) {
              fs.mkdirSync(this.options.overrides.path.gameDirectory, {recursive: true})
            }
        }

        logg.log('Attempting to load main json')
        const versionFile = await this.handler.getVersion(this.options.version.number)
        const nativePath = await this.handler.getNatives(versionFile)
        logg.warn(versionFile)
        this.options.mcPath = path.join(this.options.overrides.path.version, `${this.options.version.number}.jar`)
        if (!fs.existsSync(this.options.mcPath)) {
          logg.log('Attempting to download Minecraft version jar')
          await this.handler.getJar(versionFile)
        }

        logg.log('Attempting to download libraries')
        const classes = merge(await this.handler.getClasses(versionFile))

        logg.log('Attempting to download assets')
        await this.handler.getAssets(versionFile)

        const launchArguments = this.handler.constructJVMArguments(versionFile, nativePath, classes)
        logg.debug(`Launching with arguments ${this.options.java.javaPath} ${launchArguments.join(' ')}`)

        logg.log('nice')
        return launchArguments
    }
    async createJVM (launchArguments) {
        const minecraft = child.spawn(
            this.options.java.javaPath, 
            launchArguments,
            {
                cwd: this.options.java.cwd || this.options.overrides.path.root,
                detached: this.options.java.detached
            }
        )
        
        minecraft.stdout.on('data', (data) => logg.log(data.toString('utf-8')))
        minecraft.stderr.on('data', (data) => logg.error(data.toString('utf-8')))
        minecraft.on('close', (code) => logg.warn('ExitCode: '+code))
        return minecraft
    }
}

module.exports = launcher
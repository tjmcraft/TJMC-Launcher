const child = require('child_process')
const EventEmitter = require('events').EventEmitter
const LoggerUtil                             = require('./loggerutil')
const request                                = require('request')
const fs                                     = require('fs')
const path                                   = require('path')
const {Minecraft, merge, getOS}              = require('./Minecraft')
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
    async construct () {
        this.options = {
            javaPath: 'java',
            os: null,
            version: {
                number: 'ForgeOptiFine 1.12.2',
                type: 'modified'
            },
            request: {
                maxSockets: 32,
                timeout: 10000
            },
            path: {
                root: path.join(this.constructor.getAppData, 'minecraft'),
                version: path.join(this.constructor.getAppData, 'minecraft', 'versions'),
                directory: path.join(this.constructor.getAppData, 'minecraft', 'versions')
            },
            url: {
                resource: "https://resources.download.minecraft.net"
            },
            authorization: {
                access_token: 'null',
                name: 'MakAndJo',
                uuid: 'null',
                user_properties: ''
            },
            launch: {
                fullscreen: false,
                width: 1280,
                height: 720,
                detached: false,
                cwd: ''
            },
            memory: {
                max: 1024,
                min: 512
            }
        }
        logg.debug(`Minecraft folder ${this.options.path.root}`)
        this.handler = new Minecraft(this)
        const java = await this.handler.checkJava(this.options.javaPath || 'java')
        if (!java.run) {
            logg.error(`Couldn't start Minecraft due to: ${java.message}`)
            return null
        }
        if (!fs.existsSync(this.options.path.root)) {
            logg.log('Attempting to create root folder')
            fs.mkdirSync(this.options.path.root, {recursive: true})
        }
        if (this.options.path.gameDirectory) {
            this.options.path.gameDirectory = path.resolve(this.options.path.gameDirectory)
            if (!fs.existsSync(this.options.path.gameDirectory)) {
              fs.mkdirSync(this.options.path.gameDirectory, {recursive: true})
            }
        }
        this.options.path.version = path.join(this.options.path.root, 'versions', this.options.version.number)

        logg.log('Attempting to load main json')
        const versionFile = await this.handler.getVersion(this.options.version.number)
        const nativePath = await this.handler.getNatives(versionFile)
        logg.warn(versionFile)
        this.options.mcPath = path.join(this.options.path.version, `${this.options.version.number}.jar`)
        if (!fs.existsSync(this.options.mcPath)) {
          logg.log('Attempting to download Minecraft version jar')
          await this.handler.getJar(versionFile)
        }

        logg.log('Attempting to download libraries')
        const classes = merge(await this.handler.getClasses(versionFile))

        logg.log('Attempting to download assets')
        await this.handler.getAssets(versionFile)

        const launchArguments = this.handler.constructJVMArguments(versionFile, nativePath, classes)
        logg.debug(`Launching with arguments ${this.options.javaPath} ${launchArguments.join(' ')}`)

        const minecraft = child.spawn(
            this.options.javaPath, 
            launchArguments,
            {
                cwd: this.options.launch.cwd || this.options.path.root, 
                detached: this.options.launch.detached 
            }
        )
        
        minecraft.stdout.on('data', (data) => logg.log(data.toString('utf-8')))
        minecraft.stderr.on('data', (data) => logg.error(data.toString('utf-8')))
        minecraft.on('close', (code) => logg.warn('ExitCode: '+code))

        logg.log('nice')
        return
    }
}

module.exports = launcher
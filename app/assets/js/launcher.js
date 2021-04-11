const child                                  = require('child_process')
const EventEmitter                           = require('events')
const LoggerUtil                             = require('./loggerutil')
const fs                                     = require('fs')
const path                                   = require('path')
const Minecraft                              = require('./libs/Minecraft')
const logg = LoggerUtil('%c[Launcher]', 'color: #16be00; font-weight: bold')

class launcher extends EventEmitter {

    static openMineDir(){
        let path = API.ConfigManager.getDataDirectory();
        logg.debug('Using default path: '+path)
        API.shell.openPath(path);
    }

    constructor (options) {
        super()
        this.options = options
        this.options.overrides.path.version = path.join(this.options.overrides.path.root, 'versions', this.options.version.id)
        this.options.mcPath = path.join(this.options.overrides.path.version, `${this.options.version.id}.jar`)
        this.handler = new Minecraft(this)
        logg.debug(`Minecraft folder is ${this.options.overrides.path.root}`)
    }

    async construct () {

        const java = await this.handler.checkJava(this.options.java.javaPath || 'java')
        if (!java.run) {
            logg.error(`Couldn't start Minecraft due to: ${java.message}`)
            return
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
        const versionFile = await API.VersionManager.getVersionManifest(this.options.version.id)

        if (!fs.existsSync(this.options.mcPath)) {
            logg.log('Attempting to download Minecraft version jar')
            await this.handler.getJar(versionFile)
        }
        
        logg.log('Attempting to download natives')
        const nativePath = await this.handler.getNatives(versionFile)

        logg.log('Attempting to download libraries')
        const classes = await this.handler.getClasses(versionFile)

        logg.log('Attempting to download assets')
        const assets = await this.handler.getAssets(versionFile)

        return this.handler.constructJVMArguments(versionFile, nativePath, classes)
        
        return
    }
    async createJVM (launchArguments) {
        logg.debug(`Launching with arguments ${this.options.java.javaPath} ${launchArguments.join(' ')}`)
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
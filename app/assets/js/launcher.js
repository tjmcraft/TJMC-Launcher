const child                                  = require('child_process')
const EventEmitter                           = require('events')
const LoggerUtil                             = require('./loggerutil')
const fs                                     = require('fs')
const path                                   = require('path')
const Minecraft                              = require('./libs/Minecraft')
const logg                                   = LoggerUtil('%c[Launcher]', 'color: #16be00; font-weight: bold')
const VersionManager = require('./libs/VersionManager')
const ConfigManager = require('./libs/ConfigManager')

class launcher extends EventEmitter {

    /**
     * Minecraft launcher constructor
     * @param {Object} options - Options to construct the launcher 
     * @param {Object} options.overrides.path.version - Path to directory of version (where main jar located)
     * @param {Object} options.overrides.path.root - Path to root directory of minecraft
     * @param {Object} options.overrides.path.mcPath - Path to version main jar
     * @param {Object} options.overrides.path.gameDirectory - Path to game directory
     * @param {Object} options.java.javaPath - Path to java executable
     * @param {Object} options.version - Version config
     * @param {Object} options.installation.lastVersionId - ID of current version
     * @param {Object} options.installation.type - Type of current version
     */
    constructor (options = null) {
        super()
        this.options = options || ConfigManager.getAllOptions();
        this.options.installation = VersionManager.getInstallationSync(this.options.version)
        logg.debug(this.options.installation)
        this.options.overrides.path.gameDirectory = this.options?.installation?.gameDir || undefined;
        this.options.overrides.path.version = path.join(this.options.overrides.path.root, 'versions', this.options.installation.lastVersionId)
        this.options.mcPath = path.join(this.options.overrides.path.version, `${this.options.installation.lastVersionId}.jar`)
        this.handler = new Minecraft(this)
        logg.debug(`Minecraft folder is ${this.options.overrides.path.root}`)
    }

    async construct() {

        logg.log(`Attempting to load main json for ${this.options.installation.lastVersionId}`)
        const versionFile = await VersionManager.getVersionManifest(this.options.installation.lastVersionId)
        const javaPath = this.options?.installation?.javaPath || this.options?.java?.javaPath || 'java';

        const java = await this.handler.checkJava(javaPath)
        if (!java.run) {
            logg.error(`Couldn't start Minecraft due to: ${java.message}`)
            throw new Error(`Wrong java (${javaPath})`)
        }

        if (!fs.existsSync(this.options.overrides.path.root)) {
            logg.log(`Attempting to create root folder (${this.options.overrides.path.root})`)
            fs.mkdirSync(this.options.overrides.path.root, {recursive: true})
        }
        if (this.options.overrides.path.gameDirectory) {
            this.options.overrides.path.gameDirectory = path.resolve(this.options.overrides.path.gameDirectory)
            if (!fs.existsSync(this.options.overrides.path.gameDirectory)) {
                fs.mkdirSync(this.options.overrides.path.gameDirectory, {recursive: true})
            }
        }

        if (!fs.existsSync(this.options.mcPath)) {
            logg.log('Attempting to download Minecraft version jar')
            const mcpath = await this.handler.getJar(versionFile)
        }
        
        logg.log('Attempting to download natives')
        const nativePath = await this.handler.getNatives(versionFile)

        logg.log('Attempting to download libraries')
        const classes = await this.handler.getClasses(versionFile)

        logg.log('Attempting to download assets')
        const assets = await this.handler.getAssets(versionFile)

        return [javaPath, this.handler.constructJVMArguments(versionFile, nativePath, classes)]
    }
    async createJVM (java, launchArguments) {
        logg.debug(`Launching with arguments ${java} ${launchArguments.join(' ')}`)
        const minecraft = child.spawn(
            java,
            launchArguments,
            {
                encoding: 'utf8',
                cwd: this.options.java.cwd || this.options.overrides.path.root,
                detached: this.options.java.detached
            }
        )
        let logg_out;
        let error_out;
        minecraft.stdout.on('data', (data) => {
            logg_out = data.toString('utf-8');
            logg.log(logg_out);
        })
        minecraft.stderr.on('data', (data) => {
            error_out = data.toString('utf-8');
            logg.error(error_out);
        })
        minecraft.on('close', (code) => {
            logg.warn('ExitCode: ' + code);
        })
        return minecraft
    }
}

module.exports = launcher
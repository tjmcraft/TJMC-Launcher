const child                                  = require('child_process')
const EventEmitter                           = require('events')
const LoggerUtil                             = require('../util/loggerutil')
const fs                                     = require('fs')
const path                                   = require('path')
const Minecraft                              = require('./Minecraft')
const logg                                   = LoggerUtil('%c[Launcher]', 'color: #16be00; font-weight: bold')
const InstallationsManager                   = require('../managers/InstallationsManager')
const VersionManager                         = require('../managers/VersionManager')
const ConfigManager                          = require('../managers/ConfigManager')
const md5                                    = require('md5');

class launcher extends EventEmitter {

    /**
     * Minecraft launcher constructor
     * @param {String} version_hash - The version hash
     * @param {Object} options - Options to construct the launcher
     * @param {Object} options.overrides.path.version - Path to directory of version (where main jar located)
     * @param {Object} options.overrides.path.root - Path to root directory of minecraft
     * @param {Object} options.overrides.path.mcPath - Path to version main jar
     * @param {Object} options.overrides.path.gameDirectory - Path to game directory
     * @param {Object} options.java.javaPath - Path to java executable
     * @param {Object} options.installation.lastVersionId - ID of current version
     * @param {Object} options.installation.type - Type of current version
     */
    constructor(version_hash, options = {}) {
        super();
        return (async () => {

            this.options = Object.assign({}, await ConfigManager.getAllOptions(), { installation: await InstallationsManager.getInstallation(version_hash) }, options);
            this.options.overrides.path.gameDirectory = this.options?.installation?.gameDir || undefined;
            this.options.overrides.path.version = path.join(this.options.overrides.path.root, 'versions', this.options.installation.lastVersionId)
            this.options.mcPath = path.join(this.options.overrides.path.version, `${this.options.installation.lastVersionId}.jar`)
            this.handler = new Minecraft(this)
            this.options.auth = Object.assign({}, this.options.auth, {
                uuid: getOfflineUUID(this.options.auth.username)
            });
            logg.debug(`Minecraft folder is ${this.options.overrides.path.root}`)
            logg.debug("Launcher options:", this.options);

            return this; // when done
        })();
    }

    async heartbeat(hrs_time) {
        let count = 0;
        const interval = 500;
        const total = Math.floor((hrs_time * 1e3) / interval);
        setInterval(() => {
            if (count >= total) return;
            count++;
            this.emit('progress', {
                type: 'natives',
                task: count,
                total: total,
                version_hash: this.options.installation.hash
            });
            console.debug(`Version hash: ${this.options.installation.hash}`)
        }, interval);
    }

    async loadManifest() {
        logg.log(`Attempting to load main json for ${this.options.installation.lastVersionId}`)
        const versionFile = await VersionManager.getVersionManifest(this.options.installation.lastVersionId)
        return versionFile
    }

    async getJava() {
        const javaPath = this.options?.installation?.javaPath || this.options?.java?.javaPath || 'javaw'
        const java = await this.handler.checkJava(javaPath)
        if (!java.run) {
            logg.error(`Couldn't start Minecraft due to: ${java.message}`)
            throw new Error(`Wrong java (${javaPath})`)
        }
        return javaPath
    }

    async construct(versionFile) {

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
            logg.log('Attempting to load Minecraft version jar')
            const mcpath = await this.handler.getJar(versionFile)
        }

        logg.log('Attempting to load natives')
        const nativePath = await this.handler.getNatives(versionFile)

        logg.log('Attempting to load classes')
        const classes = await this.handler.getClasses(versionFile)

        logg.log('Attempting to load assets')
        const assets = await this.handler.getAssets(versionFile)

        const args = this.handler.constructJVMArguments(versionFile, nativePath, classes)

        return args
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

function getOfflineUUID(username) {
    let data = hex2bin(md5("OfflinePlayer:" + username));
    data = data.replaceAt(6, chr(ord(data.substr(6, 1)) & 0x0f | 0x30));
    data = data.replaceAt(8, chr(ord(data.substr(8, 1)) & 0x3f | 0x80));
    let components = [
        bin2hex(data).substr(0, 8),
        bin2hex(data).substr(8, 4),
        bin2hex(data).substr(12, 4),
        bin2hex(data).substr(16, 4),
        bin2hex(data).substr(20),
    ];
    let useruuid = components.join("");
    return useruuid;
}

const hex2bin = function (string) {
    var i = 0,
        l = string.length - 1,
        bytes = []
    for (i; i < l; i += 2) {
        bytes.push(parseInt(string.substr(i, 2), 16))
    }
    return String.fromCharCode.apply(String, bytes)
}

const bin2hex = function (string) {
    var i = 0,
        l = string.length,
        chr, hex = '';
    for (i; i < l; ++i) {
        chr = string.charCodeAt(i).toString(16)
        hex += chr.length < 2 ? '0' + chr : chr
    }
    return hex;
}

function chr(ascii) {
    return String.fromCharCode(ascii);
}
function ord(string) {
    return string.charCodeAt(0);
}

String.prototype.replaceAt = function (index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

module.exports = launcher
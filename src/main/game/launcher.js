const child                                  = require('child_process')
const EventEmitter                           = require('events')
const LoggerUtil                             = require('../util/loggerutil')
const fs                                     = require('fs')
const path                                   = require('path')
const Minecraft                              = require('./Minecraft')
const VersionManager                         = require('../managers/VersionManager')
const JavaManager                            = require('../managers/JavaManager')
const md5                                    = require('md5');

class launcher extends EventEmitter {

    /**
     * Minecraft launcher constructor
     * @param {Object} options - Options to construct the launcher
     * @param {Object} options.overrides.path.version - Path to directory of version (where main jar located)
     * @param {Object} options.overrides.path.root - Path to root directory of minecraft
     * @param {Object} options.overrides.path.mcPath - Path to version main jar
     * @param {Object} options.overrides.path.gameDirectory - Path to game directory
     * @param {Object} options.java.javaPath - Path to java executable
     * @param {Object} options.installation.lastVersionId - ID of current version
     * @param {Object} options.installation.type - Type of current version
     */
    constructor(options = {}) {
        super();

        this.logger = LoggerUtil(`%c[Launcher-${options.installation.hash}]`, 'color: #16be00; font-weight: bold');

        this.options = Object.assign({}, options);
        this.options.overrides.path.gameDirectory = path.resolve(this.options.installation?.gameDir || this.options.overrides.path?.gameDirectory || this.options.overrides.path?.root || undefined);
        this.options.overrides.path.version = path.join(this.options.overrides.path.root, 'versions', this.options.installation.lastVersionId);
        this.options.mcPath = path.join(this.options.overrides.path.version, `${this.options.installation.lastVersionId}.jar`);
        this.options.auth = Object.assign({}, this.options.auth, {
            uuid: getOfflineUUID(this.options.auth.username)
        });

        this.handler = new Minecraft(this);

        this.logger.debug(`Minecraft folder is ${this.options.overrides.path.root}`);
        this.logger.debug("Launcher compiled options:", this.options);

    }

    async getJava() {
        const javaPath = this.options?.installation?.javaPath || this.options?.java?.javaPath || 'javaw';
        const java = await JavaManager.checkJava(javaPath);
        if (!java.run) {
            this.logger.error(`Couldn't start Minecraft due to: ${java.message}`);
            throw new Error(`Wrong java (${javaPath})`);
        }
        return javaPath;
    }

    async construct() {

        const versionFile = await VersionManager.getVersionManifest(this.options.installation.lastVersionId);
        this.options.manifest = versionFile;

        if (!fs.existsSync(this.options.overrides.path.root))
            fs.mkdirSync(this.options.overrides.path.root, { recursive: true });
        if (!fs.existsSync(this.options.overrides.path.gameDirectory))
            fs.mkdirSync(this.options.overrides.path.gameDirectory, { recursive: true });
        if (!fs.existsSync(this.options.mcPath))
            await this.handler.loadClient(versionFile);

        this.logger.log('Attempting to load natives');
        const nativePath = await this.handler.getNatives(versionFile);

        this.logger.log('Attempting to load classes');
        const classes = await this.handler.getClasses(versionFile);

        this.logger.log('Attempting to load assets');
        const assets = await this.handler.getAssets(versionFile);

        const args = this.handler.constructJVMArguments(versionFile, nativePath, classes);

        return args;
    }

    async createJVM(java, launchArguments) {

        this.logger.debug(`Launching with arguments:\n${java}\xa0${launchArguments.join(' ')}`);

        const jvm = child.spawn(
            java,
            launchArguments,
            {
                encoding: 'utf8',
                cwd: this.options.java.cwd || this.options.overrides.path.root,
                detached: this.options.java.detached
            }
        );

        jvm.stdout.on('data', (data) => {
            this.logger.log(data.toString('utf-8'));
        });

        jvm.stderr.on('data', (data) => {
            this.logger.error(data.toString('utf-8'));
        });

        jvm.on('close', (code) => {
            this.logger.warn('ExitCode: ' + code);
        });

        return jvm;
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
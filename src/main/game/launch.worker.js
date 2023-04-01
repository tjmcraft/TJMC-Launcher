const fs = require('node:fs');
const path = require('node:path');
const Minecraft = require('./Minecraft');
const { getOfflineUUID } = require('../util/Tools');
const LoggerUtil = require('../util/loggerutil');

const { parentPort, workerData, isMainThread } = require("node:worker_threads");

class Launcher {

    /**
     * Minecraft launcher constructor
     * @param {Object} options - Options to construct the launcher
     * @param {Object} options.overrides.path.version - Path to directory of version (where main jar located)
     * @param {Object} options.overrides.path.minecraft - Path to root directory of minecraft
     * @param {Object} options.overrides.path.mcPath - Path to version main jar
     * @param {Object} options.overrides.path.gameDirectory - Path to game directory
     * @param {Object} options.java.javaPath - Path to java executable
     * @param {Object} options.installation.lastVersionId - ID of current version
     * @param {Object} options.installation.type - Type of current version
     */
    constructor(options = {}) {

        this.debug = true;
        this.logger = LoggerUtil(`%c[Launcher-${options.installation.hash}]`, 'color: #16be00; font-weight: bold');

        this.options = Object.assign({}, options);
        this.options.overrides.path.gameDirectory = path.resolve(this.options.installation?.gameDir || this.options.overrides.path?.gameDirectory || this.options.overrides.path?.minecraft || undefined);
        this.options.overrides.path.version = path.join(this.options.overrides.path.versions, this.options.installation.lastVersionId);
        this.options.mcPath = path.join(this.options.overrides.path.version, `${this.options.installation.lastVersionId}.jar`);
        this.options.auth = Object.assign({}, this.options.auth, {
            uuid: getOfflineUUID(this.options.auth.username)
        });

        this.handler = new Minecraft(this.options);

        this.debug && this.logger.debug(`Minecraft folder is ${this.options.overrides.path.minecraft}`);
        this.debug && this.logger.debug("Launcher compiled options:", this.options);
    }

    async construct() {

        if (!fs.existsSync(this.options.overrides.path.version))
            fs.mkdirSync(this.options.overrides.path.version, { recursive: true });
        if (!fs.existsSync(this.options.overrides.path.gameDirectory))
            fs.mkdirSync(this.options.overrides.path.gameDirectory, { recursive: true });

        this.debug && this.logger.log('Attempting to load client');
        const client = await this.handler.loadClient(this.options.manifest);

        this.debug && this.logger.log('Attempting to load natives');
        const nativePath = await this.handler.getNatives(this.options.manifest);

        this.debug && this.logger.log('Attempting to load classes');
        const classes = await this.handler.getClasses(this.options.manifest);

        this.debug && this.logger.log('Attempting to load assets');
        const assets = await this.handler.getAssets(this.options.manifest);

        const args = this.handler.constructJVMArguments(this.options.manifest, nativePath, classes);

        return args;
    }

}

if (!isMainThread) {
    const instance = new Launcher(workerData);
    instance.handler.on('progress', (e) => parentPort.postMessage({ type: 'progress', payload: e }));
    instance.handler.on('download-progress', (e) => parentPort.postMessage({ type: 'download-progress', payload: e }));
    instance.construct().then(args => {
        parentPort.postMessage({ type: 'args', payload: args });
    });
}
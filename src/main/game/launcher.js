const EventEmitter = require('events');
const LoggerUtil = require('../util/loggerutil');
const fs = require('fs');
const path = require('path');
const Minecraft = require('./Minecraft');
const { getOfflineUUID } = require('../util/Tools');

const { parentPort, workerData, isMainThread } = require("node:worker_threads");

class Launcher {

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

        this.debug = false;
        this.logger = LoggerUtil(`%c[Launcher-${options.installation.hash}]`, 'color: #16be00; font-weight: bold');

        this.options = Object.assign({}, options);
        this.options.overrides.path.gameDirectory = path.resolve(this.options.installation?.gameDir || this.options.overrides.path?.gameDirectory || this.options.overrides.path?.root || undefined);
        this.options.overrides.path.version = path.join(this.options.overrides.path.root, 'versions', this.options.installation.lastVersionId);
        this.options.mcPath = path.join(this.options.overrides.path.version, `${this.options.installation.lastVersionId}.jar`);
        this.options.auth = Object.assign({}, this.options.auth, {
            uuid: getOfflineUUID(this.options.auth.username)
        });

        this.handler = new Minecraft(this.options);

        this.debug && logger.debug(`Minecraft folder is ${this.options.overrides.path.root}`);
        this.debug && logger.debug("Launcher compiled options:", this.options);
    }

    async construct() {

        if (!fs.existsSync(this.options.overrides.path.root))
            fs.mkdirSync(this.options.overrides.path.root, { recursive: true });
        if (!fs.existsSync(this.options.overrides.path.gameDirectory))
            fs.mkdirSync(this.options.overrides.path.gameDirectory, { recursive: true });
        if (!fs.existsSync(this.options.mcPath))
            await this.handler.loadClient(this.options.manifest);

        this.debug && logger.log('Attempting to load natives');
        const nativePath = await this.handler.getNatives(this.options.manifest);

        this.debug && logger.log('Attempting to load classes');
        const classes = await this.handler.getClasses(this.options.manifest);

        this.debug && logger.log('Attempting to load assets');
        const assets = await this.handler.getAssets(this.options.manifest);

        const args = this.handler.constructJVMArguments(this.options.manifest, nativePath, classes);

        return args;
    }

}

if (!isMainThread) {
    const instance = new Launcher(workerData);
    instance.handler.on('progress', (e) => parentPort.postMessage({ type: 'progress', payload: e }));
    instance.handler.on('download-progress', (e) => parentPort.postMessage({ type: 'download-progress', payload: e }));
    parentPort.on("message", ({ type, payload = void 0 }) => {
        switch (type) {
            case 'abort': {
                instance.handler.controller.abort(payload);
            }; break;
            default: break;
        }
    });
    instance.construct().then(args => {
        parentPort.postMessage({ type: 'args', payload: args });
    });
}
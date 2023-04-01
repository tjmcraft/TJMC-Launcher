const fs = require('node:fs');
const path = require('node:path');
const Minecraft = require('./Minecraft');
const { getOfflineUUID } = require('../util/Tools');
const LoggerUtil = require('../util/loggerutil');

const { parentPort, workerData, isMainThread } = require("node:worker_threads");

if (!isMainThread) {
    if (!workerData) return;
    const options = Object.assign({}, workerData);
    options.overrides.path.gameDirectory = options.installation.gameDir || path.resolve(options.overrides.path.gameDirectory || options.overrides.path.minecraft);
    options.overrides.path.version = options.installation.versionPath || path.join(options.overrides.path.versions, options.installation.lastVersionId);
    options.mcPath = options.installation.mcPath || path.join(options.overrides.path.version, `${options.installation.lastVersionId}.jar`);
    options.auth = Object.assign({}, options.auth, {
        uuid: getOfflineUUID(options.auth.username)
    });

    const logger = LoggerUtil(`%c[Launcher-${options.installation.hash}]`, 'color: #16be00; font-weight: bold');

    const instance = new Minecraft(options);
    instance.on('progress', (e) => parentPort.postMessage({ type: 'progress', payload: e }));
    instance.on('download-progress', (e) => parentPort.postMessage({ type: 'download-progress', payload: e }));

    logger.debug("Launcher compiled options:", options);

    (async () => {
        if (!fs.existsSync(options.overrides.path.version))
            fs.mkdirSync(options.overrides.path.version, { recursive: true });
        if (!fs.existsSync(options.overrides.path.gameDirectory))
            fs.mkdirSync(options.overrides.path.gameDirectory, { recursive: true });

        logger.log('Attempting to load client');
        const client = await instance.loadClient(options.manifest);
        logger.log('Attempting to load natives');
        const nativePath = await instance.getNatives(options.manifest);
        logger.log('Attempting to load classes');
        const classes = await instance.getClasses(options.manifest);
        logger.log('Attempting to load assets');
        const assets = await instance.getAssets(options.manifest);

        const args = instance.constructJVMArguments(options.manifest, nativePath, classes);

        parentPort.postMessage({ type: 'args', payload: args });
    })();
}
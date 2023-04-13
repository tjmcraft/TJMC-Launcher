const { parentPort, isMainThread } = require("node:worker_threads");
const fs = require('node:fs');
const path = require('node:path');

const Minecraft = require('./Minecraft');
const { getOfflineUUID } = require('../util/Tools');
const LoggerUtil = require('../util/loggerutil');

const instances = new Map();

if (!isMainThread) {
	parentPort.on('message', async ({ type, payload }) => {
		if (type == 'start') {
			if (!payload) return;
			const { version_hash, launcherOptions } = payload;

			const controller = new AbortController();
			instances.set(version_hash, {
				controller
			});

			const options = Object.assign({}, launcherOptions);
			const logger = LoggerUtil(`%c[LaunchWorker-${options.installation.hash}]`, 'color: #16be00; font-weight: bold');

			controller.signal.addEventListener('abort', () => {
				logger.debug("Aborting...");
			})

			options.overrides.path.gameDirectory = options.installation.gameDir || path.resolve(options.overrides.path.gameDirectory || options.overrides.path.minecraft);
			options.overrides.path.version = options.installation.versionPath || path.join(options.overrides.path.versions, options.installation.lastVersionId);
			options.mcPath = options.installation.mcPath || path.join(options.overrides.path.version, `${options.installation.lastVersionId}.jar`);
			options.auth = Object.assign({}, options.auth, {
				uuid: getOfflineUUID(options.auth.username)
			});

			logger.debug("Launcher compiled options:", options);
			if (controller.signal.aborted) return;

			const instance = new Minecraft(options);
			instance.on('progress', (e) => parentPort.postMessage({ type: 'progress', payload: e }));

			(async () => {
				if (!fs.existsSync(options.overrides.path.version))
					fs.mkdirSync(options.overrides.path.version, { recursive: true });
				if (!fs.existsSync(options.overrides.path.gameDirectory))
					fs.mkdirSync(options.overrides.path.gameDirectory, { recursive: true });

				logger.log('Attempting to load client');
				console.time("> client");
				const client = await instance.loadClient(options.manifest, controller.signal);
				console.timeEnd("> client");
				if (controller.signal.aborted) return;
				logger.log('Attempting to load natives');
				console.time("> natives");
				const nativePath = await instance.getNatives(options.manifest, controller.signal);
				console.timeEnd("> natives");
				if (controller.signal.aborted) return;
				logger.log('Attempting to load classes');
				console.time("> classes");
				const classes = await instance.getClasses(options.manifest, controller.signal);
				console.timeEnd("> classes");
				if (controller.signal.aborted) return;
				logger.log('Attempting to load assets');
				console.time("> assets");
				const assets = await instance.getAssets(options.manifest, controller.signal);
				console.timeEnd("> assets");
				if (controller.signal.aborted) return;

				const args = instance.constructJVMArguments(options.manifest, nativePath, classes);
				if (controller.signal.aborted) return;

				instances.delete(version_hash);
				parentPort.postMessage({ type: 'args', payload: args });
			})();
		}
	});
	parentPort.on('message', async ({ type, payload }) => {
		if (type == 'abort') {
			const { version_hash } = payload;
			if (!instances.get(version_hash)) return;
			const { controller } = instances.get(version_hash);
			controller.abort();
			instances.delete(version_hash);
		}
	});
}
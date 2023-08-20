const { parentPort, isMainThread } = require("node:worker_threads");
const fs = require('node:fs');
const path = require('node:path');

const JavaManager = require("./JavaManager");
const Minecraft = require('./Minecraft');
const { getOfflineUUID } = require('../util/Tools');
const LoggerUtil = require('../util/loggerutil');

const instances = new Map();

/**
 *
 * @param {Object} options
 * @param {AbortController} controller
 * @param {Console} logger
 * @returns
 */
const resolveJava = (options, controller, logger) => new Promise(async (resolve, reject) => {
	const externalJava = options.installation.javaPath;
	const recommendedJava = options.manifest.javaVersion;

	const instance = new JavaManager(options.overrides.path.root);
	instance.on('download-progress', (e) => {
		const progress = (e.current / e.total);
		parentPort.postMessage({ type: 'java:progress', payload: progress });
	});

	const checkJava = async (javaPath, type = 'external') => {
		if (!["", undefined].includes(javaPath)) {
			const java = await instance.checkJava(javaPath);
			if (!java.run) {
				logger.error(`Wrong ${type} java (${javaPath}) => ${java.message}`);
			} else {
				logger.debug(`Using Java (${javaPath}) version ${java.version} ${java.arch}`);
				return javaPath;
			}
		}
		return undefined;
	};

	const checkExternal = async () => checkJava(externalJava, 'external');
	const checkRecommended = async () => {
		const recommended = instance.pickRecommended({ javaVersion: recommendedJava });
		const cachedJava = () => instance.getRecommendedJava(recommended.component);
		const downloadJava = () => instance.downloadJava(recommended.component, controller.signal);
		for (const task of [cachedJava, downloadJava]) {
			const java = await task();
			if (await checkJava(java, 'recommended')) return java;
		}
		return undefined;
	}
	const checkInternal = async () => checkJava('java', 'internal');

	for (const task of [checkExternal, checkRecommended, checkInternal]) {
		if (controller.signal.aborted) break;
		const java = await task();
		if (java != void 0) {
			return resolve(java);
		}
	}
	return reject("No valid java found");
	// return parentPort.postMessage({ type: 'error', payload: "No java found!" });
});

/**
 *
 * @param {Object} options
 * @param {AbortController} controller
 * @param {Console} logger
 * @param {boolean} checkOnly
 * @returns
 */
const resolveArgs = (options, controller, logger, checkOnly = false) => new Promise(async (resolve, reject) => {
	const instance = new Minecraft(options);
	if (!checkOnly) {
		const handleProgress = (() => {
			var totalProgress = 0;
			let prev = {};
			return ({ progress, type }) => {
				if (!prev[type]) prev[type] = 0;
				totalProgress += progress - prev[type];
				prev[type] = progress;
				return totalProgress;
			};
		})();
		instance.on('progress', ({task, total,type}) => {
			const current = handleProgress({
				progress: task / total,
				type: type,
			});
			parentPort.postMessage({
				type: 'args:progress',
				payload: {
					task: current,
					total: 3,
				},
			});
		});
		instance.on('download', (e) => parentPort.postMessage({ type: 'args:download', payload: e }));
	}

	if (!fs.existsSync(options.overrides.path.version)) {
		if (checkOnly) {}
		fs.mkdirSync(options.overrides.path.version, { recursive: true });
	}
	if (!fs.existsSync(options.overrides.path.gameDirectory)) {
		if (checkOnly) {}
		fs.mkdirSync(options.overrides.path.gameDirectory, { recursive: true });
	}

	if (checkOnly) {
		const [client, classes, natives, assets] = await Promise.all([
			instance.loadClient(options.manifest),
			instance.getClasses(options.manifest),
			instance.getNatives(options.manifest),
		]);
		if (controller.signal.aborted) return;
		return resolve(instance.downloadQueue.length != 0 ? 1 : 2);
	} else {
		const [client, classes, natives, assets] = await Promise.all([
			instance.loadClient(options.manifest),
			instance.getClasses(options.manifest),
			instance.getNatives(options.manifest),
			instance.getAssets(options.manifest),
		]);
		if (controller.signal.aborted) return;
		const downloadStatus = await instance.downloadQueue.load(controller.signal);
		const nativePath = await instance.extractNatives(natives);
		if (controller.signal.aborted) return;
		const args = instance.constructJVMArguments(options.manifest, nativePath, classes);
		return resolve(args);
	}
});


/**
 *
 * @param {Object} options
 * @param {AbortController} controller
 * @param {Console} logger
 * @param {boolean} checkOnly
 * @returns
 */
const processInstance = async (options, controller, logger, checkOnly = false) => {
	options.overrides.path.gameDirectory = options.installation.gameDir || path.resolve(options.overrides.path.gameDirectory || options.overrides.path.minecraft);
	options.overrides.path.version = options.installation.versionPath || path.join(options.overrides.path.versions, options.installation.lastVersionId);
	options.mcPath = options.installation.mcPath || path.join(options.overrides.path.version, `${options.installation.lastVersionId}.jar`);
	options.auth = Object.assign({}, options.auth, {
		uuid: getOfflineUUID(options.auth.username)
	});

	logger.debug("Launcher compiled options:", options);
	if (controller.signal.aborted) return;

	if (!checkOnly) {
		let javaPath = await resolveJava(options, controller, logger);
		let javaArgs = await resolveArgs(options, controller, logger);
		javaArgs = [javaPath, javaArgs].flat().filter(e => e);

		return javaArgs;
	} else {
		return await resolveArgs(options, controller, logger, checkOnly);
	}

}

if (!isMainThread) {
	const logger = LoggerUtil('%c[MainWorker]', 'color: #ff9119; font-weight: bold;');
	parentPort.on('message', async ({ type, payload }) => {
		if (type != 'check') return;
		if (!payload) return;
		const { version_hash, launcherOptions } = payload;
		try {

			const options = Object.assign({}, launcherOptions);
			const logger = LoggerUtil(`%c[LaunchWorker-${options.installation.hash}]`, 'color: #16be00; font-weight: bold');

			const controller = new AbortController();

			const instanceStatus = await processInstance(options, controller, logger, true);
			parentPort.postMessage({ type: 'check:status', payload: instanceStatus, version_hash });
		} catch (e) {
			logger.error(e);
			parentPort.postMessage({ type: 'error', payload: e, version_hash });
		} finally {
			instances.delete(version_hash);
		}
	});
	parentPort.on('message', async ({ type, payload }) => {
		if (type != 'start') return;
		if (!payload) return;
		const { version_hash, launcherOptions } = payload;
		if (instances.get(version_hash)) return parentPort.postMessage({ type: 'error', payload: "Installation already in work!", version_hash });
		try {

			const options = Object.assign({}, launcherOptions);
			const logger = LoggerUtil(`%c[LaunchWorker-${options.installation.hash}]`, 'color: #16be00; font-weight: bold');

			const controller = new AbortController();
			instances.set(version_hash, {
				controller
			});

			controller.signal.addEventListener('abort', () => {
				logger.debug("Aborting...");
				instances.delete(version_hash);
			});

			const javaArgs = await processInstance(options, controller, logger);
			parentPort.postMessage({ type: 'javaArgs', payload: javaArgs, version_hash });
		} catch (e) {
			logger.error(e);
			parentPort.postMessage({ type: 'error', payload: e, version_hash });
		} finally {
			instances.delete(version_hash);
		}
	});
	parentPort.on('message', async ({ type, payload }) => {
		if (type != 'abort') return;
		const { version_hash } = payload;
		if (!instances.get(version_hash)) return;
		const { controller } = instances.get(version_hash);
		controller.abort();
		instances.delete(version_hash);
	});
}
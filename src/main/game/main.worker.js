const { parentPort, isMainThread } = require("node:worker_threads");
const fs = require('node:fs');
const path = require('node:path');

const JavaManager = require("./JavaManager");
const Minecraft = require('./Minecraft');
const { getOfflineUUID } = require('../util/Tools');
const LoggerUtil = require('../util/loggerutil');

const instances = new Map();

if (!isMainThread) {
	const logger = LoggerUtil('%c[MainWorker]', 'color: #ff9119; font-weight: bold;');
	parentPort.on('message', async ({ type, payload }) => {
		if (type != 'start') return;
		if (!payload) return;
		const { version_hash, launcherOptions } = payload;
		if (instances.get(version_hash)) return parentPort.postMessage({ type: 'error', payload: "Installation already in work!" });
		try {

			const controller = new AbortController();
			instances.set(version_hash, {
				controller
			});

			const options = Object.assign({}, launcherOptions);
			const logger = LoggerUtil(`%c[LaunchWorker-${options.installation.hash}]`, 'color: #16be00; font-weight: bold');

			controller.signal.addEventListener('abort', () => {
				logger.debug("Aborting...");
				instances.delete(version_hash);
			})

			options.overrides.path.gameDirectory = options.installation.gameDir || path.resolve(options.overrides.path.gameDirectory || options.overrides.path.minecraft);
			options.overrides.path.version = options.installation.versionPath || path.join(options.overrides.path.versions, options.installation.lastVersionId);
			options.mcPath = options.installation.mcPath || path.join(options.overrides.path.version, `${options.installation.lastVersionId}.jar`);
			options.auth = Object.assign({}, options.auth, {
				uuid: getOfflineUUID(options.auth.username)
			});

			logger.debug("Launcher compiled options:", options);
			if (controller.signal.aborted) return;

			const javaPath = await new Promise(async (resolve, reject) => {
				const externalJava = launcherOptions.installation.javaPath;
				const recommendedJava = launcherOptions.manifest.javaVersion;

				const instance = new JavaManager(launcherOptions.overrides.path.root);
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
			parentPort.postMessage({ type: 'javaPath', payload: javaPath });

			const javaArgs = await new Promise(async (resolve, reject) => {
				const instance = new Minecraft(options);
				instance.on('progress', (e) => parentPort.postMessage({ type: 'args:progress', payload: e }));

				if (!fs.existsSync(options.overrides.path.version))
					fs.mkdirSync(options.overrides.path.version, { recursive: true });
				if (!fs.existsSync(options.overrides.path.gameDirectory))
					fs.mkdirSync(options.overrides.path.gameDirectory, { recursive: true });

				console.time('>>+stage1');
				parentPort.postMessage({ type: 'args:progress', payload: {
					type: 'load',
					task: 1,
					total: 1,
				}})
				const [client, classes, assets] = await Promise.all([
					instance.loadClient(options.manifest),
					instance.getClasses(options.manifest),
					instance.getAssets(options.manifest),
				]);
				console.timeEnd('>>+stage1');
				if (controller.signal.aborted) return;
				console.time('>>+stage2');
				parentPort.postMessage({ type: 'args:progress', payload: {
					type: 'download',
					task: 0,
					total: 1,
				}})
				const [nativePath, downloadStatus] = await Promise.all([
					instance.getNatives(options.manifest, controller.signal),
					instance.downloadQueue.load(controller.signal),
				]);
				console.timeEnd('>>+stage2');
				if (controller.signal.aborted) return;
				const args = instance.constructJVMArguments(options.manifest, nativePath, classes);
				if (controller.signal.aborted) return;
				return resolve(args);
			});
			parentPort.postMessage({ type: 'javaArgs', payload: javaArgs });

		} catch (e) {
			logger.error(e);
			parentPort.postMessage({ type: 'error', payload: e });
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

const logger = require('./util/loggerutil')('%c[Main-Launch]', 'color: #ff2119; font-weight: bold;');

const { Worker } = require("node:worker_threads");
const path = require('node:path');
const { promiseControl, promiseRequest } = require('./util/Shedulers');
const { launcherDir } = require('./Paths');

const MainWindow = require('./MainWindow');
const { Bridge, ackChannels } = require('./Host');
const AuthManager = require('./managers/AuthManager');
const ConfigManager = require('./managers/ConfigManager');
const VersionManager = require('./managers/VersionManager');
const { createInstance } = require('./managers/InstanceManager');
const InstallationsManager = require('./managers/InstallationsManager');

/**
 * @type {Worker}
 */
var MainWorker = undefined;

const runMainThread = () => {
	if (MainWorker == void 0) {
		MainWorker = new Worker(path.resolve(__dirname, "game/main.worker.js"));
		console.time('launch.worker.start');
		MainWorker.once('online', () => {
			console.timeEnd('launch.worker.start');
		});
		MainWorker.once('exit', (code) => {
			console.warn("LaunchWorker exit with code:", code);
			MainWorker = undefined;
			runMainThread();
		});
	}
};
queueMicrotask(runMainThread);

const eventListener = (event, args) => {
	switch (event) {
		case 'progress': {
			MainWindow.setProgressBar(args.progress > 0 ? args.progress : -1);
			Bridge.emit(ackChannels.gameProgressLoad, args);
		}; break;
		case 'close': {
			MainWindow.setProgressBar(-1);
			Bridge.emit(ackChannels.gameStartupError, args);
		}; break;
		case 'error': {
			MainWindow.setProgressBar(-1);
			Bridge.emit(ackChannels.gameError, args);
		}; break;
		default: break;
	}
}

const InstanceController = new function () {

	instances = new Map();
	nextUnitOfWork = null;

	const workLoop = async () => {
		nextUnitOfWork = instances.entries().next();
		if (nextUnitOfWork.value) {
			try {
				await performWorkOnUnit(nextUnitOfWork.value[1]);
			} catch (e) {
				console.error(e);
			} finally {
				remove(nextUnitOfWork.value[0]);
			}
		}
		if (instances.size > 0) return workLoop();
		nextUnitOfWork = null;
	}

	const performWorkOnUnit = async (unit) => new Promise(async (resolve, reject) => {
		try {
			const { version_hash, controller, params } = unit;
			if (!version_hash) throw new Error("version_hash is required");

			const performanceMarks = Object.seal({
				startup: 0,
				getInstallation: 0,
				getVersionManifest: 0,
				collectOptions: 0,
				loadJava: 0,
				constructArgs: 0,
				createInstance: 0,
			});

			console.debug(">>", "startLaunch");

			performanceMarks.startup = performance.now();

			const emit = (eventName, args) => eventListener(eventName, Object.assign({ version_hash }, args));
			const terminateInstance = () => {
				emit('progress', { type: 'terminated', progress: 0 });
				logger.debug("Performance marks:");
				// console.table(Object.entries(performanceMarks).map(e => ({ name: e[0], value: e[1] })));
				Object.entries(performanceMarks).map(e => ({ name: e[0], value: e[1] })).forEach(e => logger.debug(e.name, '->', e.value + 'ms'));
				logger.debug("total", '=>', Object.values(performanceMarks).reduce((c, v) => c = c + v, 0) + 'ms')
				resolve(void 0);
			}

			controller.signal.addEventListener('abort', () => {
				logger.warn("Aborting..");
				emit('progress', { type: 'aborting', progress: 0 });
				MainWorker.postMessage({ type: 'abort', payload: { version_hash } });
				terminateInstance();
			}, { once: true });

			performanceMarks.startup = performance.now() - performanceMarks.startup;

			performanceMarks.getInstallation = performance.now();
			const currentInstallation = await InstallationsManager.getInstallation(version_hash);
			performanceMarks.getInstallation = performance.now() - performanceMarks.getInstallation;
			if (!currentInstallation) throw new Error("Installation does not exist on given hash");

			if (params.forceCheck) {
				Object.assign(currentInstallation, {
					checkHash: true,
					checkFiles: true,
				})
			}

			performanceMarks.getVersionManifest = performance.now();
			emit('progress', { type: 'load:version-manifest', progress: 0.1 });
			const versionFile = await VersionManager.getVersionManifest(currentInstallation.lastVersionId, ({ progress }) => {
				emit('progress', { type: 'load:version-manifest', progress: progress });
			});
			performanceMarks.getVersionManifest = performance.now() - performanceMarks.getVersionManifest;

			try {
				performanceMarks.collectOptions = performance.now();
				const launcherOptions = Object.assign({}, ConfigManager.getAllOptionsSync(), {
					manifest: versionFile,
					installation: currentInstallation,
					auth: {
						access_token: undefined,
						user_properties: {},
						username: "MakAndJo",
						uuid: undefined,
					}
				}, params);
				Object.assign(launcherOptions.overrides.path, {
					root: launcherDir
				});
				performanceMarks.collectOptions = performance.now() - performanceMarks.collectOptions;
				if (controller.signal.aborted) return terminateInstance();
				MainWorker.postMessage({ type: 'start', payload: { version_hash, launcherOptions } });

				const argsController = promiseControl();
				const javaController = promiseControl();
				{
					const EventHandler = async ({ type, payload }) => {
						if (!controller.signal.aborted) {
							if (type == 'java:progress') {
								return emit('progress', { type: 'load:java', progress: payload });
							}
							if (type == 'args:progress') {
								const progress = (payload.task / payload.total);
								return emit('progress', { type: payload.type, progress: progress });
							}
							if (type == 'javaPath') {
								javaController.resolve(payload);
								return emit('progress', { type: 'load:java', progress: 1 });
							}
							if (type == 'error') {
								javaController.reject(payload);
								argsController.reject(payload);
							}
							if (type == 'javaArgs') {
								argsController.resolve(payload);
							}
						}
						MainWorker.off('message', EventHandler);
					}
					MainWorker.on('message', EventHandler);
				}

				performanceMarks.loadJava = performance.now();
				const javaPath = await promiseRequest(javaController);
				performanceMarks.loadJava = performance.now() - performanceMarks.loadJava;
				performanceMarks.constructArgs = performance.now(); // @TODO: create queue
				const javaArgs = await promiseRequest(argsController);
				performanceMarks.constructArgs = performance.now() - performanceMarks.constructArgs;

				if (controller.signal.aborted) return terminateInstance();

				{
					performanceMarks.createInstance = performance.now();
					logger.debug(javaPath, javaArgs.join(" "));
					const jvm = createInstance(version_hash, javaPath, javaArgs, {
						cwd: launcherOptions.java.cwd || launcherOptions.overrides.path.minecraft,
						detached: launcherOptions.java.detached
					});

					let error_out = null,
						std_out = null,
						logg_out = null;

					jvm.stderr.on('data', (data) => {
						logg_out = error_out = data.toString('utf-8');
					});
					jvm.stdout.on('data', (data) => {
						logg_out = std_out = data.toString('utf-8');
					});
					jvm.on('close', (code) => {
						if (![null, 0, 143].includes(code)) {
							emit('close', { error: logg_out });
							InstallationsManager.modifyInstallation(version_hash, {
								lastSync: undefined
							});
						}
					});
					performanceMarks.createInstance = performance.now() - performanceMarks.createInstance;
				}

				InstallationsManager.modifyInstallation(version_hash, {
					lastUsed: new Date().toISOString(),
					...(currentInstallation.checkHash ? {
						lastSync: new Date().toISOString()
					} : {})
				});

			} catch (error) {
				logger.error(error);
				emit('error', { error: error.message || error });
				InstallationsManager.modifyInstallation(version_hash, {
					lastSync: undefined
				});
			} finally {
				return terminateInstance();
			}
		} catch (e) {
			return reject(e);
		} finally {

		}
	});

	this.get = (key) => instances.get(key);
	remove = (key) => instances.delete(key);

	this.push = (unit) => {
		if (!unit.version_hash) throw new Error("version_hash is required");
		instances.set(unit.version_hash, unit);
		if (nextUnitOfWork == null) workLoop();
		return unit.version_hash;
	}

	this.abort = (key) => {
		const instance = this.get(key);
		if (instance) return (instance.controller.abort(), true);
		return false;
	}

}

exports.startLaunch = async (version_hash, params = {}) => {
	if (!version_hash) throw new Error("version_hash is required");

	const controller = new AbortController();

	if (!InstanceController.get(version_hash)) {
		const instance = Object.seal({
			version_hash,
			controller,
			params,
		});
		InstanceController.push(instance);
	} else {
		throw new Error("Same installation is already launching");
	}

}

exports.abortLaunch = async (instanceId) => InstanceController.abort(instanceId);

exports.launchWithEmit = async (version_hash, params = {}) => {
	if (!version_hash) return;
	const user = await AuthManager.getCurrentUserName();
	if (!user) return MainWindow.restore();
	Object.assign(params, {
		auth: {
			username: user,
			uuid: "",
			access_token: "",
			user_properties: {}
		}
	});
	void this.startLaunch(version_hash, params);
};
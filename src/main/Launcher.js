const { createInstance } = require('./managers/InstanceManager');

const logger = require('./util/loggerutil')('%c[Main-Launch]', 'color: #ff2119; font-weight: bold;');

const { Worker } = require("node:worker_threads");
const path = require('node:path');
const { promiseControl, promiseRequest } = require('./util/Shedulers');
const { launcherDir } = require('./Paths');

const instances = new Map();

const ConfigManager = require('./managers/ConfigManager');
const VersionManager = require('./managers/VersionManager');
const InstallationsManager = require('./managers/InstallationsManager');

exports.startLaunch = async (version_hash, params = {}, eventListener = (event, ...args) => void 0) => {
	if (!version_hash) throw new Error("version_hash is required");

	console.debug(">>", "startLaunch");

	console.time('startup')

	const emit = (eventName, args) => eventListener(eventName, args);
	const terminateInstance = () => {
		instances.delete(version_hash);
		runCallbacks();
		emit('progress', {
			type: 'terminated',
			progress: 0,
		});
		return void 0;
	}

	const controller = new AbortController();
	if (!instances.get(version_hash)) {
		const instance = Object.seal({
			controller: controller,
		});
		instances.set(version_hash, instance);
		runCallbacks();
	};

	var JavaWorker = undefined;
	var MainWorker = undefined;

	controller.signal.addEventListener('abort', () => {
		logger.warn("Aborting..");
		emit('progress', {
			type: 'aborting',
			progress: 0,
		});
		JavaWorker != void 0 && JavaWorker.terminate();
		MainWorker != void 0 && MainWorker.terminate();
		if (JavaWorker == void 0 && MainWorker == void 0) {
			return terminateInstance();
		}
	}, { once: true });

	console.timeEnd('startup')

	console.time('getInstallation')
	const currentInstallation = await InstallationsManager.getInstallation(version_hash);
	if (!currentInstallation) throw new Error("Installation does not exist on given hash");
	console.timeEnd('getInstallation')

	console.time('getVersionManifest')
	emit('progress', {
		type: 'load:version-manifest',
		progress: 0.1,
	});
	const versionFile = await VersionManager.getVersionManifest(currentInstallation.lastVersionId, ({ progress }) => {
		emit('progress', {
			type: 'load:version-manifest',
			progress: progress,
		});
	});
	console.timeEnd('getVersionManifest')

	try {

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
		if (controller.signal.aborted) return terminateInstance();
		const javaController = promiseControl();
		{
			emit('progress', {
				type: 'load:java',
				progress: 0.1,
			});
			JavaWorker = new Worker(path.resolve(__dirname, "game/java.worker.js"), {
				workerData: {
					rootDir: launcherDir,
					recommendedJava: launcherOptions.manifest.javaVersion,
					externalJava: launcherOptions.installation.javaPath || launcherOptions.java.javaPath
				}
			});
			JavaWorker.on('message', async ({ type, payload }) => {
				if (controller.signal.aborted) return;
				if (type != 'download-progress') return;
				emit('progress', {
					type: 'load:java',
					progress: payload,
				});
			});
			JavaWorker.on('message', async ({ type, payload }) => {
				if (controller.signal.aborted) return;
				if (type != 'javaPath') return;
				javaController.resolve(payload);
				JavaWorker.terminate();
				emit('progress', {
					type: 'load:java',
					progress: 1,
				});
			});
			JavaWorker.on('exit', (code) => {
				console.warn("JavaWorker exit with code:", code);
				JavaWorker = undefined;
				if (controller.signal.aborted) return terminateInstance();
			});
		}
		const javaPath = await promiseRequest(javaController);
		console.debug(">>", javaPath);
		if (controller.signal.aborted) return terminateInstance();
		const argsController = promiseControl();
		{
			MainWorker = new Worker(path.resolve(__dirname, "game/launch.worker.js"), {
				workerData: launcherOptions
			});
			MainWorker.on('message', async ({ type, payload }) => {
				if (controller.signal.aborted) return;
				if (type != 'progress') return;
				const progress = (payload.task / payload.total);
				emit('progress', {
					type: payload.type,
					progress: progress,
				});
			});
			MainWorker.on('message', async ({ type, payload }) => {
				if (controller.signal.aborted) return;
				if (type != 'args') return;
				argsController.resolve(payload);
				MainWorker.terminate();
			});
			MainWorker.on('exit', (code) => {
				console.warn("MainWorker exit with code:", code);
				MainWorker = undefined;
				if (controller.signal.aborted) return terminateInstance();
			});
		}
		const javaArgs = await promiseRequest(argsController);
		if (controller.signal.aborted) return terminateInstance();
		{
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
					emit('close', {
						error: logg_out,
					});
				}
			});

		}

	} catch (error) {
		logger.error(error);
		instances.delete(version_hash);
		runCallbacks();
		emit('error', {
			error: error.message || error,
		});
	}
	return terminateInstance();
}

exports.getInstances = () => {
	return ([...instances] || []).map(([k, v]) => k);
};
exports.getInstanceById = (instanceId) => {
	return instances.get(instanceId) || undefined;
};
exports.abortLaunch = async (instanceId) => {
	const instance = instances.get(instanceId);
	if (instance) {
		return (instance.controller.abort(), true);
	}
	return false;
};
exports.abortLaunchAll = async () => {
	return instances.forEach((value, instanceId) => this.abortLaunch(instanceId));
};

const callbacks = [void 0];
this.addCallback = (callback = (instances) => void 0) => {
	if (typeof callback === "function") callbacks.push(callback);
};
this.removeCallback = (callback = (instances) => void 0) => {
	const index = callbacks.indexOf(callback);
	if (index !== -1) callbacks.splice(index, 1);
};
const runCallbacks = () => {
	const filteredInstances = Object.entries(Object.fromEntries(instances)).map(([k, v]) => k);
	callbacks.forEach((callback) => typeof callback === "function" ? callback(filteredInstances) : null);
};
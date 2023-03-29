const { createInstance } = require('./managers/InstanceManager');
const JavaManager = require('./managers/JavaManager');

const logger = require('./util/loggerutil')('%c[Main-Launch]', 'color: #ff2119; font-weight: bold;');

const { Worker } = require("node:worker_threads");
const path = require('node:path');

const instances = new Map();

exports.startLaunch = async (version_hash, params = {}, eventListener = (event, ...args) => void 0) => {
	if (!version_hash) throw new Error("version_hash is required");

	const ConfigManager = require('./managers/ConfigManager');
	const VersionManager = require('./managers/VersionManager');
	const InstallationsManager = require('./managers/InstallationsManager');

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

	var MainWorker = undefined;

	const currentInstallation = await InstallationsManager.getInstallation(version_hash);
	if (!currentInstallation) throw new Error("Installation does not exist on given hash");

	const versionFile = await VersionManager.getVersionManifest(currentInstallation.lastVersionId);

	controller.signal.addEventListener('abort', () => {
		logger.warn("Aborting..");
		emit('progress', {
			type: 'aborting',
			progress: 0,
		});
		MainWorker != void 0 && MainWorker.terminate();
	}, { once: true });

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

		const javaManager = new JavaManager(ConfigManager.getLauncherDirectory());
		var javaPath = launcherOptions.installation?.javaPath || launcherOptions.java?.javaPath;
		if (!["", undefined].includes(javaPath)) {
			const java = await javaManager.checkJava(javaPath);
			if (!java.run) {
				this.debug && logger.error(`Wrong java (${javaPath}) => ${java.message}`);
				javaPath = undefined;
			}
		}
		if (["", undefined].includes(javaPath)) {
			javaManager.on('download-progress', (e) => {
				const progress = (e.current / e.total);
				emit('download', {
					type: 'java',
					progress: progress,
				});
			});
			const recommendedJava = javaManager.getRecommendedJava(launcherOptions.manifest);
			javaPath = await javaManager.downloadJava(recommendedJava.component, controller.signal);
			if (controller.signal.aborted) return terminateInstance();
			const java = await javaManager.checkJava(javaPath);
			if (!java.run) {
				javaPath = undefined;
				this.debug && logger.error(`Error while loading recommended java: ${recommendedJava.component}`);
			}
		}
		if (["", undefined].includes(javaPath)) {
			javaPath = 'java';
			const java = await javaManager.checkJava(javaPath);
			if (!java.run) {
				javaPath = undefined;
				this.debug && logger.error(`Error with default java (${javaPath}) => ${java.message}`);
			}
		}
		if (["", undefined].includes(javaPath)) {
			throw new Error("Error while loading java");
		}

		MainWorker = new Worker(path.resolve(__dirname, "game/launcher.js"), {
			workerData: launcherOptions
		});

		MainWorker.on('message', async ({ type, payload }) => {
			if (type != 'progress') return;
			if (controller.signal.aborted) return;
			const progress = (payload.task / payload.total);
			emit('progress', {
				type: payload.type,
				progress: progress,
			});
		});

		MainWorker.on('message', async ({ type, payload }) => {
			if (type != 'download-progress') return;
			if (controller.signal.aborted) return;
			const progress = (payload.current / payload.total);
			if (!['version-jar'].includes(payload.type)) return;
			emit('download', {
				type: payload.type,
				progress: progress,
			});
		});

		MainWorker.on('message', async ({ type, payload }) => {
			if (type != 'args') return;
			if (controller.signal.aborted) return;

			const jvm = createInstance(version_hash, javaPath, payload, {
				cwd: launcherOptions.java.cwd || launcherOptions.overrides.path.root,
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

			MainWorker.terminate();

			emit('success');
		});

		MainWorker.on('exit', (code) => {
			console.warn("Worker exit with code:", code);
			return terminateInstance();
		});

		return true;

	} catch (error) {
		logger.error(error);
		instances.delete(version_hash);
		runCallbacks();
		emit('error', {
			error: error.message || error,
		});
	}
	return false;
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
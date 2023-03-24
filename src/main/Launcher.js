const { createInstance } = require('./managers/InstanceManager');

const logger = require('./util/loggerutil')('%c[Main-Launch]', 'color: #ff2119; font-weight: bold;');

const { Worker } = require("node:worker_threads");
const path = require('node:path');


const getJava = async (launcherOptions) => {
	const JavaManager = require('./managers/JavaManager');
	const javaPath = launcherOptions?.installation?.javaPath || launcherOptions?.java?.javaPath || 'javaw';
	const java = await JavaManager.checkJava(javaPath);
	if (!java.run) {
			this.debug && logger.error(`Couldn't start Minecraft due to: ${java.message}`);
			throw new Error(`Wrong java (${javaPath})`);
	}
	return javaPath;
}

const launchMinecraft = async (version_hash, params = {}, eventListener = (event, ...args) => void 0) => {
	const ConfigManager = require('./managers/ConfigManager');
	const VersionManager = require('./managers/VersionManager');
	const InstallationsManager = require('./managers/InstallationsManager');

	const emit = (eventName, ...args) => eventListener(eventName, ...args);

	if (!version_hash) throw new Error("version_hash is required");

	const currentInstallation = await InstallationsManager.getInstallation(version_hash);
	if (!currentInstallation) throw new Error("Installation does not exist on given hash");

	const versionFile = await VersionManager.getVersionManifest(currentInstallation.lastVersionId);

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

		const javaPath = await getJava(launcherOptions);
		const worker = new Worker(path.resolve(__dirname, "game/launcher.js"), {
			workerData: launcherOptions
		});

		worker.on('message', async ({ type, payload }) => {
			if (type != 'progress') return;
			const progress = (payload.task / payload.total);
			emit('progress', {
				type: payload.type,
				progress: progress,
				version_hash: version_hash,
			});
		});

		worker.on('message', async ({ type, payload }) => {
			if (type != 'download-progress') return;
			const progress = (payload.current / payload.total);
			if (payload.type != 'version-jar') return;
			emit('download', {
				type: payload.type,
				progress: progress,
				version_hash: version_hash,
			});
		});

		worker.on('message', async ({ type, payload }) => {
			if (type != 'args') return;

			const jvm = await createInstance(version_hash, javaPath, payload, {
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
					events.close != void 0 && events.close({
						error: logg_out,
						version_hash: version_hash
					});
				}
			});

			emit('success', {
				version_hash: version_hash
			});
		})

		return true;

	} catch (error) {
		logger.error(error);
		emit('error', {
			error: error.message,
			version_hash: version_hash
		});
	}
	return false;
}

module.exports = launchMinecraft;
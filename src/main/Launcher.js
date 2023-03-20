const { createInstance } = require('./managers/InstanceManager');

const logger = require('./util/loggerutil')('%c[Main-Launch]', 'color: #ff2119; font-weight: bold;');

exports.launchMinecraft = async (version_hash, params = {}) => {
	const Host = require('./Host');
	const ConfigManager = require('./managers/ConfigManager');
	const VersionManager = require('./managers/VersionManager');
	const InstallationsManager = require('./managers/InstallationsManager');
	const MainWindow = require('./MainWindow');

	if (!version_hash) throw new Error("version_hash is required");

	const currentInstallation = await InstallationsManager.getInstallation(version_hash);
	if (!currentInstallation) throw new Error("Installation does not exist on given hash");

	const GameLauncher = require('./game/launcher');

	function progress(e) {
		const progress = (e.task / e.total);
		Host.Bridge.emit(Host.ackChannels.gameProgressLoad, {
			progress: progress,
			version_hash: version_hash
		});
	}

	function download_progress(e) {
		const progress = (e.current / e.total);
		if (e.type != 'version-jar') return;
		Host.Bridge.emit(Host.ackChannels.gameProgressDownload, {
			progress: progress,
			version_hash: version_hash
		});
	}

	try {

		const launcherOptions = Object.assign({}, ConfigManager.getAllOptionsSync(), {
			installation: currentInstallation,
			auth: {
				access_token: undefined,
				user_properties: {},
				username: "MakAndJo",
				uuid: undefined,
			}
		}, params);

		const launcher = new GameLauncher(launcherOptions);
		launcher.on('progress', progress);
		launcher.on('download-status', download_progress);

		const javaPath = await launcher.getJava();
		const minecraftArguments = await launcher.construct();
		const jvm = await createInstance(version_hash, javaPath, minecraftArguments, {
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
			if (code != 0 && code != 143) {
				MainWindow.setProgressBar(-1);
				Host.Bridge.emit(Host.ackChannels.gameStartupError, {
					error: logg_out,
					version_hash: version_hash
				});
			}
		});

		MainWindow.setProgressBar(-1);
		Host.Bridge.emit(Host.ackChannels.gameStartupSuccess, {
			version_hash: version_hash
		});

		return true;

	} catch (error) {
		logger.error(error);
		MainWindow.setProgressBar(-1);
		Host.Bridge.emit(Host.ackChannels.gameError, {
			error: error.message,
			version_hash: version_hash
		});
	}
	return false;
}


const TCHost = require('./libs/TCHost');

/* === TCHost init === */

const requestChannels = Object.seal({
	requestHostInfo: 'requestHostInfo',
	setProgress: 'setProgress',
	invokeLaunch: 'invokeLaunch',
	revokeLaunch: 'revokeLaunch',
	fetchInstallations: 'fetchInstallations',
	fetchInstances: 'fetchInstances',
	killInstance: 'killInstance',
	killAllInstances: 'killAllInstances',
	fetchVersions: 'fetchVersions',
	createInstallation: 'createInstallation',
	removeInstallation: 'removeInstallation',
	fetchConfiguration: 'fetchConfiguration',
	setConfiguration: 'setConfiguration',
	fetchSystemMem: 'fetchSystemMem',
	fetchHostVersion: 'fetchHostVersion',
	selectFolder: 'selectFolder',
	selectFile: 'selectFile',
	relaunchHost: 'relaunchHost',
	updateCheck: 'updateCheck',
	updateDownload: 'updateDownload',
	updateInstall: 'updateInstall',
});
exports.requestChannels = requestChannels;

const ackChannels = Object.seal({
	updateConfiguration: 'updateConfiguration',
	updateInstallations: 'updateInstallations',
	updateInstances: 'updateInstances',
	gameProgressLoad: 'game.progress.load',
	gameProgressDownload: 'game.progress.download',
	gameStartupSuccess: 'game.startup.success',
	gameStartupError: 'game.startup.error',
	gameError: 'game.error',
	updateStatus: 'update.status',
	updateProgress: 'update.progress',
});
exports.ackChannels = ackChannels;

const updateStatus = Object.seal({
	error: 'error',
	checking: 'checking',
	available: 'available',
	notAvailable: 'not-available',
	downloaded: 'loaded',
});
exports.updateStatus = updateStatus;

/**
* TCHost instance
* @type {TCHost}
*/
var WSSHost = new TCHost();
exports.Bridge = WSSHost;

exports.start = async () => {
	try {
		WSSHost.start();
		await initHandlers();
		return WSSHost;
	} catch (e) { }
	return undefined;
}

const os = require('os');
const { ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const { checkForUpdates } = require('./Updater');
const MainWindow = require('./MainWindow');
const { startLaunch, abortLaunch } = require('./Launcher');

const ConfigManager = require('./managers/ConfigManager');
const VersionManager = require('./managers/VersionManager');
const InstallationsManager = require('./managers/InstallationsManager');
const InstanceManager = require('./managers/InstanceManager');

/**
* Init reducers for TCHost
*/
const initHandlers = async () => {

	// add sender to main window web contents
	WSSHost.addSender(WSSHost.updateTypes.ACK, (type, payload) => MainWindow.send(type, payload));

	Object.keys(requestChannels).forEach(channel => {
		const event = requestChannels[channel];
		ipcMain.handle(event, WSSHost.handleIPCInvoke(event)); // handle rpc messages for electron sender
	})

	{ // Updates
		autoUpdater.on('error', (e) => WSSHost.emit(ackChannels.updateStatus, { status: updateStatus.error }));
		autoUpdater.on('checking-for-update', (e) => WSSHost.emit(ackChannels.updateStatus, { status: updateStatus.checking }));
		autoUpdater.on('update-available', (e) => {
			WSSHost.emit(ackChannels.updateStatus, {
				status: updateStatus.available,
				update: {
					tag: e.tag,
					version: e.version,
					releaseDate: e.releaseDate,
					releaseName: e.releaseName,
					// releaseNotes: e.releaseNotes,
				}
			});
		});
		autoUpdater.on('update-not-available', (e) => WSSHost.emit(ackChannels.updateStatus, { status: updateStatus.notAvailable }));
		autoUpdater.on('download-progress', (e) => {
			WSSHost.emit(ackChannels.updateProgress, {
				total: e.total,
				transferred: e.transferred,
				delta: e.delta,
				bytesPerSecond: e.bytesPerSecond,
				percent: e.percent
			});
		});
		autoUpdater.on('update-downloaded', (e) => {
			WSSHost.emit(ackChannels.updateStatus, {
				status: updateStatus.downloaded,
				update: {
					tag: e.tag,
					version: e.version,
					releaseDate: e.releaseDate,
					releaseName: e.releaseName,
					// releaseNotes: e.releaseNotes,
				}
			});
		});

		WSSHost.addReducer(requestChannels.updateCheck, () => checkForUpdates());
		WSSHost.addReducer(requestChannels.updateDownload, () => {
			WSSHost.emit(ackChannels.updateProgress, { percent: 0 });
			autoUpdater.downloadUpdate();
		});
		WSSHost.addReducer(requestChannels.updateInstall, ({ isSilent = true, isForceRunAfter = true }) =>
			autoUpdater.quitAndInstall(isSilent, isForceRunAfter)
		);
	}

	// Main

	{ // Host
		WSSHost.addReducer(requestChannels.requestHostInfo, () => ({
			hostVendor: 'TJMC-Launcher',
			hostVersion: autoUpdater.currentVersion,
			hostMemory: os.totalmem() / 1024 / 1024,
		}));

		WSSHost.addReducer(requestChannels.relaunchHost, () => {
			app.relaunch();
		});

		WSSHost.addReducer(requestChannels.setProgress, (data) => {
			if (data.progress) win?.setProgressBar(data.progress);
		});
	}

	{ // Launching
		WSSHost.addReducer(requestChannels.invokeLaunch, async (data) => {
			if (!data.version_hash) return false;
			const { version_hash, params = {} } = data;
			const eventListener = (event, args) => {
				args = Object.assign({ version_hash }, args);
				switch (event) {
					case 'download': {
						WSSHost.emit(ackChannels.gameProgressDownload, args);
					}; break;
					case 'progress': {
						WSSHost.emit(ackChannels.gameProgressLoad, args);
					}; break;
					case 'close': {
						MainWindow.setProgressBar(-1);
						WSSHost.emit(ackChannels.gameStartupError, args);
					}; break;
					case 'success': {
						MainWindow.setProgressBar(-1);
						WSSHost.emit(ackChannels.gameStartupSuccess, args);
					}; break;
					case 'error': {
						MainWindow.setProgressBar(-1);
						WSSHost.emit(ackChannels.gameError, args);
					}; break;
					default: break;
				}
			}
			setImmediate(() => startLaunch(version_hash, params, eventListener));
			return true;
		});
		WSSHost.addReducer(requestChannels.revokeLaunch, async (data) => {
			if (!data.version_hash) return false;
			return abortLaunch(data.version_hash);
		});
	}

	WSSHost.addReducer(requestChannels.fetchVersions, async () => {
		const versions = await VersionManager.getGlobalVersions();
		return { versions };
	});

	{ // Instances
		InstanceManager.addCallback(instances => {
			// console.debug("Update Instances:", instances);
			instances && WSSHost.emit(ackChannels.updateInstances, { instances: instances });
		});
		WSSHost.addReducer(requestChannels.fetchInstances, async () => {
			const instances = InstanceManager.getInstances(true);
			return { instances: instances };
		});
		WSSHost.addReducer(requestChannels.killInstance, async ({ instanceId }) =>
			await InstanceManager.killInstance(instanceId)
		);
		WSSHost.addReducer(requestChannels.killAllInstances, async () =>
			await InstanceManager.killAllInstances()
		);
	}

	{ // Installations
		InstallationsManager.addCallback(config => {
			// console.debug("Update Installations:", config);
			config?.profiles && WSSHost.emit(ackChannels.updateInstallations, { installations: config.profiles });
		});
		WSSHost.addReducer(requestChannels.fetchInstallations, async () => {
			const installations = await InstallationsManager.getInstallations();
			return { installations };
		});
		WSSHost.addReducer(requestChannels.createInstallation, async (data) =>
			await InstallationsManager.createInstallation(data)
		);
		WSSHost.addReducer(requestChannels.removeInstallation, async ({ hash, forceDeps }) =>
			await InstallationsManager.removeInstallation(hash, forceDeps)
		);
	}

	{ // Configuration
		ConfigManager.addCallback(config => {
			// console.debug("Update Config:", config);
			config && WSSHost.emit(ackChannels.updateConfiguration, { configuration: config });
		});
		WSSHost.addReducer(requestChannels.fetchConfiguration, async () => {
			const configuration = await ConfigManager.getAllOptions();
			return { configuration };
		});
		WSSHost.addReducer(requestChannels.setConfiguration, async ({ key, value }) =>
			await ConfigManager.setOption(key, value)
		);
	}

	{ // Dialogs
		WSSHost.addReducer(requestChannels.selectFolder, async ({ title }) => {
			const { canceled, filePaths } = await dialog.showOpenDialog(MainWindow.window, {
				title: title || 'Select a folder',
				properties: ["openDirectory", "createDirectory", "promptToCreate"]
			});
			console.debug("[selectFolder]", filePaths);
			return { canceled, filePaths };
		});
		WSSHost.addReducer(requestChannels.selectFile, async ({ title }) => {
			const { canceled, filePaths } = await dialog.showOpenDialog(MainWindow.window, {
				title: title || 'Select a file',
				properties: ["openFile"]
			});
			console.debug("[selectFile]", filePaths);
			return { canceled, filePaths };
		});
	}

};
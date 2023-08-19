
const TCHost = require('./libs/TCHost');

/* === TCHost init === */

const requestChannels = Object.seal({
	requestHostInfo: 'requestHostInfo',
	fetchCurrentUser: 'auth:fetchCurrentUser',
	requestAuth: 'auth:requestAuth',
	revokeAuth: 'auth:revokeAuth',
	invokeLaunch: 'invokeLaunch',
	revokeLaunch: 'revokeLaunch',
	fetchInstallations: 'fetchInstallations',
	fetchInstances: 'fetchInstances',
	killInstance: 'killInstance',
	killAllInstances: 'killAllInstances',
	fetchVersions: 'fetchVersions',
	createInstallation: 'createInstallation',
	editInstallation: 'editInstallation',
	removeInstallation: 'removeInstallation',
	moveInstallationPosition: 'moveInstallationPosition',
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
	openMinecraftFolder: 'openMinecraftFolder',
	openVersionsFolder: 'openVersionsFolder',
	openInstallationFolder: 'openInstallationFolder',
});
exports.requestChannels = requestChannels;

const ackChannels = Object.seal({
	updateAuthState: 'auth:updateAuthState',
	updateCurrentUser: 'auth:updateCurrentUser',
	updateConfiguration: 'updateConfiguration',
	updateInstallations: 'updateInstallations',
	updateInstances: 'updateInstances',
	gameProgressLoad: 'game.progress.load',
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
const { ipcMain, dialog, shell, app } = require('electron');
const { autoUpdater } = require('electron-updater');
const { checkForUpdates } = require('./Updater');
const MainWindow = require('./MainWindow');
const Launcher = require('./Launcher');

const ConfigManager = require('./managers/ConfigManager');
const VersionManager = require('./managers/VersionManager');
const InstallationsManager = require('./managers/InstallationsManager');
const InstanceManager = require('./managers/InstanceManager');
const AuthManager = require('./managers/AuthManager');

/**
* Init reducers for TCHost
*/
const initHandlers = async () => {

	// add sender to main window web contents
	WSSHost.addSender(WSSHost.updateTypes.ACK, (type, payload) => MainWindow.send(type, payload));

	Object.keys(requestChannels).forEach(channel => {
		const event = requestChannels[channel];
		ipcMain.handle(event, WSSHost.handleIPCInvoke(event)); // handle rpc messages for electron sender
	});

	void Launcher.preflightChecks();

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

		let interval = undefined;
		const initInterval = () => {
			interval && clearInterval(interval);
			interval = setInterval(() => {
				if (ConfigManager.getOption("launcher.checkUpdates")) {
					checkForUpdates();
				}
			}, 1e3 * 60 * ConfigManager.getOption("launcher.checkUpdatesInterval"));
		}
		ConfigManager.watchOption("launcher.checkUpdatesInterval")(state => initInterval());
		queueMicrotask(initInterval);

		WSSHost.addReducer(requestChannels.updateCheck, () => checkForUpdates());
		WSSHost.addReducer(requestChannels.updateDownload, () => {
			WSSHost.emit(ackChannels.updateProgress, { percent: 0 });
			autoUpdater.downloadUpdate();
		});
		WSSHost.addReducer(requestChannels.updateInstall, ({ isSilent = true, isForceRunAfter = true }) =>
			autoUpdater.quitAndInstall(isSilent, isForceRunAfter)
		);
	}

	{ // Host
		WSSHost.addReducer(requestChannels.requestHostInfo, () => {
			const menu = app.applicationMenu.items.map(m => ({
				label: m.label,
				role: m.role,
				commandId: m.commandId,
				enabled: m.enabled,
				submenu: m.submenu.items.map(sm => ({
					type: sm.type,
					label: sm.label,
					commandId: sm.commandId,
					enabled: sm.enabled,
					accelerator: sm.accelerator,
				})),
			}));
			return {
				hostVendor: 'TJMC-Launcher',
				hostVersion: autoUpdater.currentVersion,
				hostMemory: os.totalmem() / 1024 / 1024,
				hostMenu: menu,
			}
		});
		WSSHost.addReducer(requestChannels.relaunchHost, () => {
			app.relaunch();
		});
		WSSHost.addReducer(requestChannels.openMinecraftFolder, async () => {
			shell.openPath(ConfigManager.getMinecraftDirectory());
		});
		WSSHost.addReducer(requestChannels.openVersionsFolder, async () => {
			shell.openPath(ConfigManager.getVersionsDirectory());
		});
	}

	{ // Auth
		WSSHost.addReducer(requestChannels.requestAuth, async ({ username }) => {
			if (username) {
				AuthManager.handleOfflineAuth(username);
			} else {
				shell.openExternal(AuthManager.handleTJMCAuth());
			}
			return undefined;
		});
		AuthManager.on('handle-code', () => {
			MainWindow.focus();
			WSSHost.emit(ackChannels.updateAuthState, { authState: 'handleCode' });
		});
		AuthManager.on('user-switch', (user) => {
			console.debug("[auth]", user);
			WSSHost.emit(ackChannels.updateCurrentUser, user);
		});
		WSSHost.addReducer(requestChannels.revokeAuth, async () => {
			await AuthManager.logoutCurrentUser();
			return { code: 1 };
		});
		WSSHost.addReducer(requestChannels.fetchCurrentUser, async () => {
			return { user: await AuthManager.getCurrentUser() };
		});
	}

	{ // Launching
		WSSHost.addReducer(requestChannels.invokeLaunch, async (data) => {
			if (!data.version_hash) return false;
			return await Launcher.launchWithEmit(data.version_hash, data.params);
		});
		WSSHost.addReducer(requestChannels.revokeLaunch, async (data) => {
			if (!data.version_hash) return false;
			return Launcher.abortLaunch(data.version_hash);
		});
	}

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
			const installations = InstallationsManager.getInstallations();
			return { installations };
		});
		WSSHost.addReducer(requestChannels.createInstallation, async (data) => {
			const hash = await InstallationsManager.createInstallation(data);
			return { hash };
		});
		WSSHost.addReducer(requestChannels.editInstallation, async (data) =>
			await InstallationsManager.modifyInstallation(data.hash, data.installation)
		);
		WSSHost.addReducer(requestChannels.removeInstallation, async ({ hash, forceDeps }) =>
			await InstallationsManager.removeInstallation(hash, forceDeps)
		);
		WSSHost.addReducer(requestChannels.moveInstallationPosition, async ({ startHash, endHash }) => {
			await InstallationsManager.moveInstallationPosition(startHash, endHash);
		});
		WSSHost.addReducer(requestChannels.fetchVersions, async () => {
			const versions = await VersionManager.getGlobalVersions();
			return { versions };
		});
		WSSHost.addReducer(requestChannels.openInstallationFolder, async ({ hash }) => {
			const installation = await InstallationsManager.getInstallation(hash);
			shell.openPath(installation.versionDir);
		});
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
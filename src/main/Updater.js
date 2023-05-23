const { autoUpdater } = require('electron-updater');
const updateLogger = require('./util/loggerutil')('%c[AutoUpdate]', 'color: #ffd119; font-weight: bold;');

autoUpdater.logger = updateLogger;
autoUpdater.allowPrerelease = true;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.autoDownload = false;

autoUpdater.setFeedURL({
	provider: "github",
	owner: "tjmcraft",
	repo: "TJMC-Launcher",
});

const checkForUpdates = () => {
	const Host = require('./Host');
	autoUpdater.checkForUpdates().then(updates => {
		updateLogger.debug("-> Updates:", updates);
		if (!updates) autoUpdater.emit('update-not-available');
	}).catch(err => {
		updateLogger.error("-> Error:", err);
		autoUpdater.emit('update-not-available');
	});
	Host.Bridge.emit(Host.ackChannels.updateStatus, { status: Host.updateStatus.checking });
};

exports.checkForUpdates = checkForUpdates;
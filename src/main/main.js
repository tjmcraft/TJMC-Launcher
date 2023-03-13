'use strict';
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater');

console.time("> require");

const os = require('os');

const ConfigManager = require('./managers/ConfigManager');
const VersionManager = require('./managers/VersionManager');
const InstallationsManager = require('./managers/InstallationsManager');

const TCHost = require('./libs/TCHost');

const { destroyTray, createTray } = require('./tray');
const { restoreMainWindow, createMainWindow, MainWindow: win } = require('./MainWindow');

const logger = require('./util/loggerutil')('%c[MainThread]', 'color: #ff2119; font-weight: bold;');
const updateLogger = require('./util/loggerutil')('%c[AutoUpdate]', 'color: #ffd119; font-weight: bold;');

console.timeEnd("> require");

autoUpdater.logger = updateLogger;
autoUpdater.allowPrerelease = true;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.autoDownload = false;

autoUpdater.setFeedURL({
    provider: "github",
    owner: "tjmcraft",
    repo: "TJMC-Launcher",
});

const DEFAULT_PROTOCOL_HANDLER = "tjmc";

const setInstanceProtocolHandler = () => {
    if (process.platform === "linux") {
        const command = "xdg-settings set default-url-scheme-handler"
        const packageName = "tjmc-launcher_tjmc-launcher.desktop"

        // TODO: Figure out bug in setAsDefaultProtocolClient on Linux
        // Set Protocol Handler on Linux manually because of bug in Electron
        try {
            require('child_process').exec(`${command} ${DEFAULT_PROTOCOL_HANDLER} ${packageName}`)
            logger.info("Successfully set protocol handler on Linux.")
        } catch (e) {
            logger.warn(`Failed to set Protocol Handler on Linux: ${e}`)
        }
    } else {
        app.setAsDefaultProtocolClient(DEFAULT_PROTOCOL_HANDLER)
    }
}

const protoHandler = (link) => {
    if (!link) return;

    const { host: command, path: argument } = require('url').parse(link);
    const args = argument.split('/').slice(1);

    logger.debug("[ProtoHandler]", link, "->", command, args);

    switch (command) {

        case "launch": {
            const version_hash = args[0];
            launchMinecraft(version_hash);
        }; break;

        default: return false;
    }

    return true;
};

const handleArgsLink = (args) => {
    if (process.platform === 'win32') {
        const deepLink = args.find((arg) => arg.startsWith(DEFAULT_PROTOCOL_HANDLER + '://'));
        if (deepLink) return protoHandler(deepLink);
    }
    return false;
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
    return;
} else {

    console.time("> init lock");

    logger.debug("Process args:", process.argv);

    app.on('second-instance', (event, commandLine, workingDirectory) => {
        console.debug("Second instance call", commandLine);
        if (!handleArgsLink(commandLine)) {
            restoreMainWindow();
        }
    });

    app.on('open-url', (event, data) => {
        event.preventDefault();
        console.debug("Open url call", data);
        if (!protoHandler(data)) {
            restoreMainWindow();
        }
    });

    ConfigManager.load(); // Load config

    // Hardware acceleration.
    if (ConfigManager.getOption("launcher.disableHardwareAcceleration")) {
        app.disableHardwareAcceleration();
    }

    app.once('ready', () => {

        // Entry point -->
        console.time("> init managers");
        setInstanceProtocolHandler();
        try {
            VersionManager.load(ConfigManager.getVersionsDirectory()); // set versions dir
            VersionManager.updateGlobalVersionsConfig(); // update global versions manifest
            InstallationsManager.load(ConfigManager.getLauncherDirectory()); // set installations config dir
            startSocketServer().catch(void 0); // start socket and ipc servers
        } catch (e) {
            logger.error("[Startup]", "Error:", e);
            app.quit();
        }
        console.timeEnd("> init managers");

        console.time("> init ready");
        createTray().catch(void 0);
        require('@electron/remote/main').initialize();

        if (!handleArgsLink(process.argv)) {
            createMainWindow().catch((e) => {
                logger.error("[MainWindow]", "Error:", e);
                app.quit();
            });
        }

        console.timeEnd("> init ready");
    });

    app.on("window-all-closed", () => { });

    app.on('activate', () => {
        restoreMainWindow();
    });

    app.on('before-quit', () => {
        win != void 0 && win.destroy();
        destroyTray();
    });

    console.timeEnd("> init lock");
}

const checkForUpdates = () => {
    autoUpdater.checkForUpdates().then(updates => {
        updateLogger.debug("-> Updates:", updates);
        if (!updates) autoUpdater.emit('update-not-available');
    }).catch(err => {
        updateLogger.error("-> Error:", err);
        autoUpdater.emit('update-not-available');
    });
    WSSHost.emit(ackChannels.updateStatus, { status: updateStatus.checking });
}


async function launchMinecraft(version_hash, params = {}) {

    if (!version_hash) throw new Error("version_hash is required");

    const currentInstallation = await InstallationsManager.getInstallation(version_hash);
    if (!currentInstallation) throw new Error("Installation does not exist on given hash");

    const GameLauncher = require('./game/launcher');

    function progress(e) {
        const progress = (e.task / e.total);
        WSSHost.emit(ackChannels.gameProgressLoad, {
            progress: progress,
            version_hash: version_hash
        });
    }

    function download_progress(e) {
        const progress = (e.current / e.total);
        if (e.type != 'version-jar') return;
        WSSHost.emit(ackChannels.gameProgressDownload, {
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
        logger.debug('launcherOptions', launcherOptions);

        const launcher = new GameLauncher(launcherOptions);
        launcher.on('progress', progress);
        launcher.on('download-status', download_progress);

        const javaPath = await launcher.getJava();
        const minecraftArguments = await launcher.construct();
        const jvm = await launcher.createJVM(javaPath, minecraftArguments);
        logger.log("[Main]", "Starting minecraft! Version Hash:", version_hash);

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
            if (code != 0) {
                win?.setProgressBar(-1);
                WSSHost.emit(ackChannels.gameStartupError, {
                    error: logg_out,
                    version_hash: version_hash
                });
            }
        });

        win?.setProgressBar(-1);
        WSSHost.emit(ackChannels.gameStartupSuccess, {
            version_hash: version_hash
        });

        return true;

    } catch (error) {
        logger.error(error);
        win?.setProgressBar(-1);
        WSSHost.emit(ackChannels.gameError, {
            error: error.message,
            version_hash: version_hash
        });
    }
    return false;
}

/* === TCHost init === */

const requestChannels = Object.seal({
    requestHostInfo: 'requestHostInfo',
    invokeLaunch: 'invokeLaunch',
    setProgress: 'setProgress',
    fetchInstallations: 'fetchInstallations',
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

const ackChannels = Object.seal({
    updateConfiguration: 'updateConfiguration',
    updateInstallations: 'updateInstallations',
    gameProgressLoad: 'game.progress.load',
    gameProgressDownload: 'game.progress.download',
    gameStartupSuccess: 'game.startup.success',
    gameStartupError: 'game.startup.error',
    gameError: 'game.error',
    updateStatus: 'update.status',
    updateProgress: 'update.progress',
});

const updateStatus = Object.seal({
    error: 'error',
    checking: 'checking',
    available: 'available',
    notAvailable: 'not-available',
    downloaded: 'loaded',
});

/**
 * TCHost instance
 * @type {TCHost}
 */
var WSSHost = new TCHost();

const startSocketServer = async () => {
    WSSHost.start();
    await initHandlers();
    return WSSHost;
}

/**
 * Init reducers for TCHost
 */
const initHandlers = async () => {
    // add sender to main window web contents
    WSSHost.addSender(WSSHost.updateTypes.ACK, (type, payload) => win != void 0 && win.webContents.send(type, payload));

    Object.keys(requestChannels).forEach(channel => {
        const event = requestChannels[channel];
        ipcMain.handle(event, WSSHost.handleIPCInvoke(event)); // handle rpc messages for electron sender
    })

    ConfigManager.addCallback(config => {
        // console.debug("Update Config:", config);
        config && WSSHost.emit(ackChannels.updateConfiguration, { configuration: config });
    });

    InstallationsManager.addCallback(config => {
        // console.debug("Update Installations:", config);
        config?.profiles && WSSHost.emit(ackChannels.updateInstallations, { installations: config.profiles });
    });

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

    WSSHost.addReducer(requestChannels.invokeLaunch, async (data) => {
        if (data.version_hash) {
            let result;
            try {
                result = await launchMinecraft(data.version_hash, data.params = {});
            } catch (err) {
                console.error(err);
                return false;
            }
            return result;
        }
        return false;
    });

    WSSHost.addReducer(requestChannels.fetchVersions, async () => {
        const versions = await VersionManager.getGlobalVersions();
        return { versions };
    });

    { // Installations
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
            const { canceled, filePaths } = await dialog.showOpenDialog(win, {
                title: title || 'Select a folder',
                properties: ["openDirectory", "createDirectory", "promptToCreate"]
            });
            console.debug("[selectFolder]", filePaths);
            return { canceled, filePaths };
        });
        WSSHost.addReducer(requestChannels.selectFile, async ({ title }) => {
            const { canceled, filePaths } = await dialog.showOpenDialog(win, {
                title: title || 'Select a file',
                properties: ["openFile"]
            });
            console.debug("[selectFile]", filePaths);
            return { canceled, filePaths };
        });
    }

};
'use strict';
const { app, BrowserWindow, Menu, ipcMain, shell, Tray, nativeImage, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

console.time("> require");

const path = require('path');
const os = require('os');

const ConfigManager = require('./managers/ConfigManager');
const VersionManager = require('./managers/VersionManager');
const InstallationsManager = require('./managers/InstallationsManager');

const TCHost = require('./libs/TCHost');

const { destroyTray, createTray } = require('./tray');
const { restoreWindow } = require('./helpers');

const logger = require('./util/loggerutil')('%c[MainThread]', 'color: #ff2119; font-weight: bold;');
const updateLogger = require('./util/loggerutil')('%c[AutoUpdate]', 'color: #ffd119; font-weight: bold;');

console.timeEnd("> require");

autoUpdater.logger = updateLogger;
autoUpdater.allowPrerelease = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.setFeedURL({
    provider: "github",
    owner: "tjmcraft",
    repo: "TJMC-Launcher",
});

app.allowRendererProcessReuse = true;

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

/**
 * @type {BrowserWindow} - The main window
 */
var win = undefined;

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
        const deepLink = args.find((arg) => arg.startsWith('tjmc://'));
        if (deepLink) return protoHandler(deepLink);
    }
    return false;
}

const createPreloadWindow = () => new Promise((resolve, reject) => {
    const window = new BrowserWindow({
        width: 300,
        height: 300,
        resizable: false,
        show: false,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            nativeWindowOpen: false,
        },
        titleBarStyle: 'default',
        roundedCorners: true,
        backgroundColor: '#171614'
    });

    window.loadFile(path.join(__dirname, '../..', 'app', 'index.html'));
    logger.debug("[Preload]", "Created preload window!");
    window.once('show', () => resolve(window));
    window.once('ready-to-show', () => window.show());
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
    return;
} else {

    console.time("> init lock");

    logger.debug("Process args:", process.argv);

    app.on('second-instance', (event, commandLine, workingDirectory) => {
        console.debug("Second instance call", commandLine);
        if (!handleArgsLink(commandLine)) restoreWindow();
    });

    app.on('open-url', (event, data) => {
        event.preventDefault();
        console.debug("Open url call", data);
        if (!protoHandler(data)) restoreWindow();
    });

    // Entry point -->
    ConfigManager.load(); // Load config

    // Hardware acceleration.
    if (ConfigManager.getDisableHardwareAcceleration()) app.disableHardwareAcceleration();

    app.once('ready', () => {
        console.time("> init ready");
        setInstanceProtocolHandler();

        require('@electron/remote/main').initialize();

        createPreloadWindow().then(async (window) => {

            console.time("> init preload");

            // Handlers
            const event_updateError = (e) => window.webContents.send('update.error', e);
            const event_updateChecking = (e) => window.webContents.send('update.check', e);
            const event_updateAvailable = (e) => window.webContents.send('update.available', e);
            const event_updateProgress = (e) => window.webContents.send('update.progress', e);
            const event_updateDownloaded = (e) => window.webContents.send('update.downloaded', e);
            const action_updateInstall = (e, isSilent = true, isForceRunAfter = true) => autoUpdater.quitAndInstall(isSilent, isForceRunAfter);

            autoUpdater.on('error', event_updateError);
            autoUpdater.on('checking-for-update', event_updateChecking);
            autoUpdater.on('update-available', event_updateAvailable);
            autoUpdater.on('download-progress', event_updateProgress);
            autoUpdater.on('update-downloaded', event_updateDownloaded);
            ipcMain.on('update.install', action_updateInstall);

            autoUpdater.once('update-not-available', async () => {
                console.time("> init managers");
                try {
                    VersionManager.load(ConfigManager.getVersionsDirectory());
                    VersionManager.updateGlobalVersionsConfig();
                    InstallationsManager.load(ConfigManager.getLauncherDirectory());
                    startSocketServer().catch(void 0); // похуй + поебать
                } catch (e) {
                    logger.error("[Startup]", "Error:", e);
                    app.quit();
                }
                console.timeEnd("> init managers");
                if (!handleArgsLink(process.argv)) {
                    try {
                        require('./menu').createMenu();
                        await createMainWindow();
                    } catch (e) {
                        logger.error("[MainWindow]", "Error:", e);
                        app.quit();
                    };
                }
                // Disable handlers
                autoUpdater.off('error', event_updateError);
                autoUpdater.off('checking-for-update', event_updateChecking);
                autoUpdater.off('update-available', event_updateAvailable);
                autoUpdater.off('download-progress', event_updateProgress);
                autoUpdater.off('update-downloaded', event_updateDownloaded);
                ipcMain.off('update.install', action_updateInstall);
                window.close();
            });

            createTray();

            if (ConfigManager.getCheckUpdates()) { // Check updates if need
                autoUpdater.checkForUpdates().then(updates => {
                    updateLogger.debug("-> Updates:", updates);
                    if (!updates) autoUpdater.emit('update-not-available');
                }).catch(err => {
                    updateLogger.error("-> Error:", err);
                    autoUpdater.emit('update-not-available');
                });
            } else {
                autoUpdater.emit('update-not-available');
            }

            console.timeEnd("> init preload");

        });
        console.timeEnd("> init ready");
    });

    app.on("window-all-closed", () => { });

    app.on('activate', () => {
        if (win === null) createMainWindow();
        else restoreWindow();
    });

    app.on('before-quit', () => {
        win && win.destroy();
        destroyTray();
    });

    console.timeEnd("> init lock");
}

const createMainWindow = () => new Promise((resolve, reject) => {

    let windowState = require('./libs/WindowState')({
        width: 1280,
        height: 720
    });

    win = new BrowserWindow({
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
        minWidth: 950,
        minHeight: 480,
        show: false,
        resizable: true,
        frame: process.platform === 'darwin',
        webPreferences: {
            preload: path.join(__dirname, 'preloader.js'),
            nodeIntegration: false,
            contextIsolation: true,
            worldSafeExecuteJavaScript: true,
            spellcheck: true,
            enableRemoteModule: true,
        },
        titleBarStyle: 'default',
        roundedCorners: true,
        backgroundColor: '#171614'
    });

    require('@electron/remote/main').enable(win.webContents);

    windowState.manage(win);

    win.loadFile(path.resolve(__dirname, '../render/dist/index.html'));

    logger.log("[Main]", "Created main window!");

    win.once('show', () => resolve(win));
    win.once('ready-to-show', () => win.show());
    win.on('enter-full-screen', () => win.webContents.send('enter-full-screen'));
    win.on('leave-full-screen', () => win.webContents.send('leave-full-screen'));
    win.on('blur', () => win.webContents.send('blur'));
    win.on('focus', () => win.webContents.send('focus'));
    win.on('closed', () => win = null);
    win.on('close', (event) => {
        if (ConfigManager.getHideOnClose()) {
            event.preventDefault();
            win.hide();
        }
    });

    // win.show()

    win.webContents.openDevTools()
});

async function launchMinecraft(version_hash, params = {}) {

    if (!version_hash) throw new Error("version_hash is required");

    const currentInstallation = InstallationsManager.getInstallationSync(version_hash);

    if (!currentInstallation) throw new Error("Installation does not exist on given hash");

    const GameLauncher = require('./game/launcher');

    function progress(e) {
        const progress = (e.task / e.total);
        WSSHost.emit('game.progress.load', {
            progress: progress,
            version_hash: e.version_hash
        });
    }

    function download_progress(e) {
        const progress = (e.current / e.total);
        if (e.type != 'version-jar') return;
        WSSHost.emit('game.progress.download', {
            progress: progress,
            version_hash: e.version_hash
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

        logger.log("[Main]", "Starting minecraft! Version Hash:", version_hash);

        const JVM = await launcher.createJVM(javaPath, minecraftArguments);

        let error_out = null,
            std_out = null,
            logg_out = null;

        JVM.stderr.on('data', (data) => {
            logg_out = error_out = data.toString('utf-8');
        });

        JVM.stdout.on('data', (data) => {
            logg_out = std_out = data.toString('utf-8');
        });

        JVM.on('close', (code) => {
            if (code != 0) {
                win?.setProgressBar(-1);
                WSSHost.emit('game.startup.error', {
                    error: logg_out,
                    version_hash: version_hash
                });
            }
        });

        win?.setProgressBar(-1);
        WSSHost.emit('game.startup.success', {
            version_hash: version_hash
        });

        return true;

    } catch (error) {
        logger.error(error);
        win?.setProgressBar(-1);
        WSSHost.emit('game.error', {
            error: error,
            version_hash: version_hash
        });
    }
    return false;
}

/* === TCHost init === */

const validChannels = {
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
};

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
    WSSHost.addSender(WSSHost.updateTypes.ACK, (type, payload) => win.webContents.send(type, payload));
    //WSSHost.addSender(WSSHost.updateTypes.RPC, win.webContents.send);

    Object.keys(validChannels).forEach(channel => {
        const event = validChannels[channel];
        ipcMain.handle(event, WSSHost.handleIPCInvoke(event)); // handle rpc messages for electron sender
    })

    ConfigManager.addCallback(config => {
        console.debug("Update Config:", config);
        WSSHost.emit("updateConfiguration", { configuration: config });
    });

    InstallationsManager.addCallback(config => {
        console.debug("Update Installations:", config);
        config?.profiles && WSSHost.emit("updateInstallations", { installations: config.profiles });
    })

    WSSHost.addReducer(validChannels.requestHostInfo, () => ({
        hostVendor: 'TJMC-Launcher',
        hostVersion: autoUpdater.currentVersion,
        hostMemory: os.totalmem() / 1024 / 1024,
    }));

    WSSHost.addReducer(validChannels.invokeLaunch, async (data) => {
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

    WSSHost.addReducer(validChannels.setProgress, (data) => {
        if (data.progress) {
            win?.setProgressBar(data.progress);
        }
    });

    WSSHost.addReducer(validChannels.fetchInstallations, async () => {
        const installations = await InstallationsManager.getInstallations();
        return { installations };
    });

    WSSHost.addReducer(validChannels.createInstallation, async (data) => {
        return await InstallationsManager.createInstallation(data);
    });

    WSSHost.addReducer(validChannels.removeInstallation, async ({ hash, forceDeps }) => {
        return await InstallationsManager.removeInstallation(hash, forceDeps);
    });

    WSSHost.addReducer(validChannels.fetchVersions, async () => {
        const versions = await VersionManager.getGlobalVersions();
        return { versions };
    });

    WSSHost.addReducer(validChannels.fetchConfiguration, async () => {
        const configuration = await ConfigManager.getAllOptions();
        return { configuration };
    });

    WSSHost.addReducer(validChannels.setConfiguration, async ({ key, value }) => {
        return await ConfigManager.setOption(key, value);
    });

    WSSHost.addReducer(validChannels.selectFolder, async ({ title }) => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            title: title || 'Select a folder',
            properties: ["openDirectory", "createDirectory", "promptToCreate"]
        });
        console.debug(">>fp", filePaths);
        if (canceled) return undefined;
        return filePaths;
    });

};
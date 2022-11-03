'use strict';
const { app, BrowserWindow, Menu, ipcMain, shell, nativeTheme } = require('electron');
const { autoUpdater } = require('electron-updater');

const path = require('path');
const url = require('url');
const os = require('os');

const ConfigManager = require('./managers/ConfigManager');
const VersionManager = require('./managers/VersionManager');
const InstallationsManager = require('./managers/InstallationsManager');

const WindowState = require('./libs/WindowState');

const launcher = require('./game/launcher');

const logger = require('./util/loggerutil')('%c[MainThread]', 'color: #ff2119; font-weight: bold');
const updateLogger = require('./util/loggerutil')('%c[AutoUpdate]', 'color: #ffd119; font-weight: bold');

autoUpdater.logger = updateLogger;
autoUpdater.allowPrerelease = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.setFeedURL({
    provider: "github",
    owner: "tjmcraft",
    repo: "TJMC-Launcher",
});

app.allowRendererProcessReuse = true;

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
        icon: getPlatformIcon('icon'),
        backgroundColor: '#171614'
    });

    window.loadFile(path.join(__dirname, '../..', 'app', 'loading', 'index.html'));

    logger.debug("[Preload]", "Created preload window!");

    window.once('show', () => resolve(window));
    window.once('ready-to-show', () => window.show());
});

const gotTheLock = app.requestSingleInstanceLock();

/**
 * @type {BrowserWindow} - The main window
 */
var win = undefined;

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (win) {
            if (win.isMinimized()) win.restore();
            win.focus();
        }
    });
    app.once('ready', () => {

        require('@electron/remote/main').initialize();

        createPreloadWindow().then(window => {

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
                try {
                    VersionManager.updateGlobalVersionsConfig();
                    startSocketServer().catch((e) => { throw e; });
                    startWebServer().catch((e) => { throw e; });
                } catch (e) {
                    logger.error("[Startup]", "Error:", e);
                    app.quit();
                }
                createMainWindow().then(() => {
                    //window.hide();
                    autoUpdater.off('error', event_updateError);
                    autoUpdater.off('checking-for-update', event_updateChecking);
                    autoUpdater.off('update-available', event_updateAvailable);
                    autoUpdater.off('download-progress', event_updateProgress);
                    autoUpdater.off('update-downloaded', event_updateDownloaded);
                    ipcMain.off('update.install', action_updateInstall);
                    window.close();
                });
            });

            ConfigManager.load();

            // Hardware acceleration.
            ConfigManager.getDisableHarwareAcceleration() && app.disableHardwareAcceleration();

            if (ConfigManager.getCheckUpdates()) {
                autoUpdater.checkForUpdates().then(updates => {
                    updateLogger.debug("-> Updates:", updates);
                    if (!updates) autoUpdater.emit('update-not-available');
                }).catch(err => {
                    updateLogger.error("-> Error:", err);
                    autoUpdater.emit('update-not-available');
                });
            }

        });
    });
    app.once('ready', () => createMenu());
    //app.on('window-all-closed', () => app.quit());
    //app.on('activate', () => (win === null) && createWindow());
}

const createMainWindow = () => new Promise((resolve, reject) => {

    let windowState = WindowState({
        width: 1280,
        height: 720
    })

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
        icon: getPlatformIcon('icon'),
        backgroundColor: '#171614'
    });

    require('@electron/remote/main').enable(win.webContents);

    windowState.manage(win);

    win.loadURL("https://app.tjmcraft.ga/");

    logger.log("[Main]", "Created main window!");

    win.once('show', () => resolve(win));
    win.once('ready-to-show', () => win.show());
    win.on('enter-full-screen', () => win.webContents.send('enter-full-screen'));
    win.on('leave-full-screen', () => win.webContents.send('leave-full-screen'));
    win.on('blur', () => win.webContents.send('blur'));
    win.on('focus', () => win.webContents.send('focus'));
    win.on('closed', () => win = null);

    //win.webContents.openDevTools()

    ipcMain.handle('ping', async (event, ...args) => args);
    ipcMain.handle('launch-mine', async (event, version_hash = null, params = null) => launchMinecraft(version_hash, params));
    ipcMain.handle('set.progress.bar', async (event, args) => win?.setProgressBar(args));
    ipcMain.handle('installations.get', async (event, ...args) => await InstallationsManager.getInstallations());
    ipcMain.handle('versions.get.global', async (event, ...args) => await VersionManager.getGlobalVersions());
    ipcMain.handle('installations.create', async (event, version, options) => await InstallationsManager.createInstallation(version, options));
    ipcMain.handle('configuration.get', async (event, ...args) => await ConfigManager.getAllOptions());
    ipcMain.handle('configuration.set', async (event, args) => await ConfigManager.setOptions(args));
    ipcMain.handle('system.mem', async (event, ...args) => os.totalmem() / 1024 / 1024);
    ipcMain.handle('version', async (event, ...args) => autoUpdater.currentVersion);

    const setOSTheme = () => {
        let source = nativeTheme.themeSource;
        const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
        win.webContents.send('theme.update', {
            source: source,
            theme: theme
        });
    }
    nativeTheme.on('updated', () => setOSTheme());
});

async function launchMinecraft(version_hash = null, params = null) {
    function progress(e) {
        const progress = (e.task / e.total);
        if (win) win.webContents.send('progress', {
            progress: progress,
            version_hash: e.version_hash
        });
        if (socket_connector) socket_connector.send('progress', {
            progress: progress,
            version_hash: e.version_hash
        });
    }

    function download_progress(e) {
        const progress = (e.current / e.total);
        if (e.type != 'version-jar') return;
        if (win) win.webContents.send('progress', {
            progress: progress,
            version_hash: e.version_hash
        });
        if (socket_connector) socket_connector.send('progress', {
            progress: progress,
            version_hash: e.version_hash
        });
    }
    try {
        const _launcher = await new launcher(version_hash, params);
        _launcher.on('progress', progress);
        _launcher.on('download-status', download_progress);

        //const hb = await _launcher.heartbeat(60);

        const java_path = await _launcher.getJava();
        const versionFile = await _launcher.loadManifest();
        const minecraftArguments = await _launcher.construct(versionFile);
        logger.log("[Main]", "Starting minecraft! Version Hash:", version_hash);
        const vm = await _launcher.createJVM(java_path, minecraftArguments);

        let error_out = null,
            std_out = null,
            logg_out = null;
        vm.stderr.on('data', (data) => {
            logg_out = error_out = data.toString('utf-8');
        })
        vm.stdout.on('data', (data) => {
            logg_out = std_out = data.toString('utf-8');
        })
        vm.on('close', (code) => {
            if (code != 0) {
                if (win)
                    win.webContents.send('startup-error', {
                        error: logg_out,
                        version_hash: version_hash
                    }) && win.setProgressBar(-1)
                if (socket_connector)
                    socket_connector.send('startup-error', {
                        error: logg_out,
                        version_hash: version_hash
                    });
            }
        })
        if (win)
            win.webContents.send('startup-success', {
                version_hash: version_hash
            }) && win.setProgressBar(-1)
        if (socket_connector)
            socket_connector.send('startup-success', {
                version_hash: version_hash
            });
        return true;
    } catch (error) {
        if (win)
            win.webContents.send('error', {
                error: error,
                version_hash: version_hash
            }) && win.setProgressBar(-1)
        if (socket_connector)
            socket_connector.send('error', {
                error: error,
                version_hash: version_hash
            });
    }
    return false;
}

const express = require('express');
const express_app = express();

function startWebServer() {
    return new Promise((resolve, reject) => {
        const e_server = express_app.listen(5248);
        e_server.on('error', err => reject(err));
        express_app.use(express.json()) // for parsing application/json
        express_app.use(function (req, res, next) {
            res.header('Content-Type', 'application/json');
            const allowedOrigins = ['http://127.0.0.1:3333', 'http://localhost:3333', 'http://192.168.0.12:3333', 'https://app.tjmcraft.ga'];
            const origin = req.headers.origin;
            if (allowedOrigins.includes(origin)) {
                res.setHeader('Access-Control-Allow-Origin', origin);
            }
            res.header('Access-Control-Allow-Headers', '*');
            next();
        });
        express_app.get('/ping', (req, res) => {
            res.json({
                pong: true
            });
        });
        express_app.get('/version', (req, res) => {
            res.json(autoUpdater.currentVersion);
        });
        express_app.post('/launch-mine', async (req, res) => {
            const data = req.body;
            if (!data || !data.version_hash) res.json({
                success: false
            });
            res.json(await launchMinecraft(data.version_hash, data.params));
        });
        express_app.get('/installations.get', async (req, res) => {
            res.json(await InstallationsManager.getInstallations());
        });
        express_app.get('/versions.get.global', async (req, res) => {
            res.json(await VersionManager.getGlobalVersions());
        });
        express_app.post('/installations.create', async (req, res) => {
            const data = req.body;
            if (!data || !data.version || !data.options) res.json({
                success: false
            });
            res.json(await InstallationsManager.createInstallation(data.version, data.options));
        });
        express_app.get('/configuration.get', async (req, res) => {
            res.json(await ConfigManager.getAllOptions());
        });
        express_app.post('/configuration.set', async (req, res) => {
            const data = req.body;
            if (!data) res.json({
                success: false
            });
            res.json(await ConfigManager.setOptions(data));
        });
        express_app.get('/system.mem', async (req, res) => {
            res.json(os.totalmem() / 1024 / 1024);
        })
        express_app.get('*', function (req, res) {
            res.send({
                status: 404,
                error: `Not found`,
                success: false
            });
        });
        resolve(express_app);
    })
}

const WebSocket = require('ws');

var socket_connector;

const startSocketServer = () =>
    new Promise((resolve, reject) => {
        function SocketConnect(socket) {
            const sendJSON = (type = null, data) => {
                socket.send(JSON.stringify({
                    type: type,
                    data: data
                }));
            }
            sendJSON('status', 'connected');
            this.send = (type = null, data) => {
                if (socket) sendJSON(type, data);
            }
            return this;
        }
        const wss = new WebSocket.Server({
            port: 4836
        });
        wss.on('error', (err) => {
            reject(err);
        });
        wss.on('connection', socket => {
            socket_connector = new SocketConnect(socket);
        });
        resolve(wss);
    });


const createMenu = async () => {
    const isMac = (process.platform === 'darwin');
    const template = [
        ...(isMac ? [{
            label: 'Application',
            submenu: [{
                    label: 'About Application',
                    selector: 'orderFrontStandardAboutPanel:'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: () => {
                        app.quit()
                    }
                }
            ]
        }] : []),
        {
            label: 'Minecraft',
            submenu: [{
                    label: 'Root Directory',
                    accelerator: isMac ? 'Cmd+Alt+D' : 'Ctrl+Shift+D',
                    click: () => openMineDir()
                },
                {
                    label: 'Options',
                    accelerator: isMac ? 'Cmd+Alt+I' : 'Ctrl+Shift+I',
                    click: () => win.webContents.send('open-settings')
                }
            ]
        },
        // { role: 'editMenu' }
        {
            label: 'Edit',
            submenu: [{
                    role: 'undo'
                },
                {
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'cut'
                },
                {
                    role: 'copy'
                },
                {
                    role: 'paste'
                },
                ...(isMac ? [{
                        role: 'pasteAndMatchStyle'
                    },
                    {
                        role: 'delete'
                    },
                    {
                        role: 'selectAll'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Speech',
                        submenu: [{
                                role: 'startSpeaking'
                            },
                            {
                                role: 'stopSpeaking'
                            }
                        ]
                    }
                ] : [{
                        role: 'delete'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        role: 'selectAll'
                    }
                ])
            ]
        },
        // { role: 'viewMenu' }
        {
            label: 'View',
            submenu: [{
                    role: 'reload'
                },
                {
                    role: 'forceReload'
                },
                {
                    role: 'toggleDevTools',
                    accelerator: 'F12'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'resetZoom'
                },
                {
                    role: 'zoomIn',
                    accelerator: 'Ctrl+='
                },
                {
                    role: 'zoomOut',
                    accelerator: 'Ctrl+-'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'togglefullscreen',
                    accelerator: 'F11'
                }
            ]
        },
        // { role: 'windowMenu' }
        {
            label: 'Window',
            submenu: [{
                    role: 'minimize'
                },
                {
                    role: 'zoom'
                },
                ...(isMac ? [{
                        type: 'separator'
                    },
                    {
                        role: 'front'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        role: 'window'
                    }
                ] : [{
                    role: 'close'
                }])
            ]
        }
    ];
    const menuObject = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menuObject);

}

function getPlatformIcon(filename) {
    let ext;
    switch (process.platform) {
        case 'win32':
            ext = 'ico';
            break;
        case 'darwin':
            ext = 'icns';
            break;
        case 'linux':
        default:
            ext = 'png';
            break;
    }
    return path.join(__dirname, '../..', 'build', `${filename}.${ext}`);
}

function openMineDir() {
    const path = ConfigManager.getDataDirectory();
    logger.debug("[Main]", "{OpenMineDir}", "Path:", path);
    shell.openPath(path);
}
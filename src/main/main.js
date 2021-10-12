'use strict';
const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    shell,
    nativeTheme
} = require('electron');
const {
    autoUpdater
} = require('electron-updater');
const express = require('express')
const express_app = express()
const WebSocket = require('ws')
const path = require('path');
const url = require('url');
const os = require('os');
const WindowState = require('./libs/WindowState');
const logger = require('./util/loggerutil')('%c[MainThread]', 'color: #dfa109; font-weight: bold');
require('@electron/remote/main').initialize();

const ConfigManager = require('./managers/ConfigManager');
ConfigManager.load();
const VersionManager = require('./managers/VersionManager');
VersionManager.updateGlobalVersionsConfig();
const launcher = require('./game/launcher');
const InstallationsManager = require('./managers/InstallationsManager');

autoUpdater.logger = logger;
autoUpdater.allowPrerelease = true;
autoUpdater.autoInstallOnAppQuit = true;

// Disable hardware acceleration.
//app.disableHardwareAcceleration()

app.allowRendererProcessReuse = true

const createPreloadWindow = async () => {
    let window = new BrowserWindow({
        width: 240,
        height: 280,
        resizable: false,
        show: false,
        frame: false,
        webPreferences: {
            nativeWindowOpen: true,
            nodeIntegration: false
        },
        titleBarStyle: 'default',
        roundedCorners: true,
        icon: getPlatformIcon('icon'),
        backgroundColor: '#171614'
    });

    window.once('show', async () => {
        await startSocketServer();
        await startWebServer();
        createMainWindow(() => {
            window.hide()
            window.close()
        });
        createMenu();
    })

    window.loadURL(path.join(__dirname, '../..', 'app', 'loading', 'index.html'));
    window.once('ready-to-show', () => {
        window.show();
    })
    
}

const gotTheLock = app.requestSingleInstanceLock()

/**
 * @type {BrowserWindow} - The main window
 */
let win

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (win) {
            if (win.isMinimized()) win.restore()
            win.focus()
        }
    })
    app.on('ready', createPreloadWindow)
    //app.on('ready', createMenu)
    app.on('window-all-closed', () => app.quit())
    app.on('activate', () => (win === null) && createWindow())
}

const createMainWindow = async (cb = () => {}) => {

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
            enableRemoteModule: true,
            worldSafeExecuteJavaScript: true,
            spellcheck: true
        },
        titleBarStyle: 'default',
        roundedCorners: true,
        icon: getPlatformIcon('icon'),
        backgroundColor: '#171614'
    })

    windowState.manage(win)

    win.loadURL("https://app.tjmcraft.ga/")

    win.once('ready-to-show', () => {
        autoUpdater.checkForUpdatesAndNotify();
        win.show();
        cb.call();
    })
    win.on('enter-full-screen', () => win.webContents.send('enter-full-screen'))
    win.on('leave-full-screen', () => win.webContents.send('leave-full-screen'))
    win.on('blur', () => win.webContents.send('blur'))
    win.on('focus', () => win.webContents.send('focus'))
    win.on('closed', () => win = null)

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

    if (process.platform == 'darwin') {
        const setOSTheme = () => {
            let source = nativeTheme.themeSource;
            const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
            win.webContents.send('theme.update', {
                source: source,
                theme: theme
            });
        }
        nativeTheme.on('updated', () => setOSTheme());
    }
}

var socket_connector;

async function startSocketServer() {
    const ws_server = new WebSocket.Server({
        port: 4836
    });
    ws_server.on('connection', socket => {
        socket_connector = new SocketConnect(socket);
    });
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
    }
    return ws_server;
}


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
        logger.log('Starting minecraft! vh: ' + version_hash)
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
                if (win) win.webContents.send('startup-error', {
                    error: logg_out,
                    version_hash: version_hash
                });
                if (socket_connector) socket_connector.send('startup-error', {
                    error: logg_out,
                    version_hash: version_hash
                });
            }
        })
        if (win) win.webContents.send('startup-success', {
            version_hash: version_hash
        });
        if (socket_connector) socket_connector.send('startup-success', {
            version_hash: version_hash
        });
        return true;
    } catch (error) {
        if (win) win.webContents.send('error', {
            error: error.message,
            version_hash: version_hash
        });
        if (socket_connector) socket_connector.send('error', {
            error: error.message,
            version_hash: version_hash
        });
    }
    return false;
}

async function startWebServer() {
    const e_server = express_app.listen(5248);
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
    return express_app;
}

autoUpdater.on('error', (e) => win?.webContents.send('error', e));
autoUpdater.on('checking-for-update', () => win?.webContents.send('update.check'));
autoUpdater.on('update-available', (e) => win?.webContents.send('update.available', e));
autoUpdater.on('download-progress', (e) => win?.webContents.send('update.progress', e));
autoUpdater.on('update-downloaded', (e) => win?.webContents.send('update.downloaded', e));

async function createMenu() {
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
    return path.join(__dirname, 'build', `${filename}.${ext}`);
}

function openMineDir() {
    const path = ConfigManager.getDataDirectory();
    logger.debug('Using default path: ' + path)
    shell.openPath(path);
}
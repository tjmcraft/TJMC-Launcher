const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const express = require('express')
const express_app = express()
const WebSocket = require('ws')
const path = require('path');
const url = require('url');
const os = require('os');
const WindowState = require('./app/assets/js/libs/WindowState');
const logger = require('./app/assets/js/loggerutil')('%c[MainThread]', 'color: #dfa109; font-weight: bold');
require('@electron/remote/main').initialize();

const ConfigManager = require('./app/assets/js/libs/ConfigManager');
ConfigManager.load();
const VersionManager = require('./app/assets/js/libs/VersionManager');
VersionManager.updateGlobalVersionsConfig();
const launcher = require('./app/assets/js/launcher');
const InstallationsManager = require('./app/assets/js/libs/InstallationsManager');

// Disable hardware acceleration.
//app.disableHardwareAcceleration()

app.allowRendererProcessReuse = true
var socket_connector;
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
    
    app.on('ready', createWindow)
    app.on('ready', createMenu)

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit()
    })

    app.on('activate', () => {
        if (win === null) createWindow()
    })
}

function createWindow () {
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
            preload: path.join(__dirname, 'app', 'assets', 'js', 'preloader.js'),
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

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'app', 'app.html'),
        protocol: 'file:',
        slashes: true
    }))

    win.once('ready-to-show', () => { win.show() })
    win.on('enter-full-screen', () => { win.webContents.send('enter-full-screen') })
    win.on('leave-full-screen', () => { win.webContents.send('leave-full-screen') })
    win.on('blur', () => { win.webContents.send('blur') })
    win.on('focus', () => { win.webContents.send('focus') })
    win.on('closed', () => { win = null })

    //win.webContents.openDevTools()
}

function createMenu() {
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
            }]
        }] : []),
        {
            label: 'Minecraft',
            submenu: [
                {
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
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                ...(isMac ? [
                    { role: 'pasteAndMatchStyle' },
                    { role: 'delete' },
                    { role: 'selectAll' },
                    { type: 'separator' },
                    {
                        label: 'Speech',
                        submenu: [
                            { role: 'startSpeaking' },
                            { role: 'stopSpeaking' }
                        ]
                    }
                ] : [
                    { role: 'delete' },
                    { type: 'separator' },
                    { role: 'selectAll' }
                ])
            ]
        },
        // { role: 'viewMenu' }
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools', accelerator: 'F12' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn', accelerator: 'Ctrl+=' },
                { role: 'zoomOut', accelerator: 'Ctrl+-' },
                { type: 'separator' },
                { role: 'togglefullscreen', accelerator: 'F11' }
            ]
        },
        // { role: 'windowMenu' }
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                ...(isMac ? [
                    { type: 'separator' },
                    { role: 'front' },
                    { type: 'separator' },
                    { role: 'window' }
                ] : [
                    { role: 'close' }
                ])
            ]
        }
    ];
    const menuObject = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menuObject);

}

function getPlatformIcon(filename){
  let ext;
  switch(process.platform) {
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
    logger.debug('Using default path: '+path)
    shell.openPath(path);
}

ipcMain.handle('ping', async (event, ...args) => args);

ipcMain.handle('launch-mine', async (event, version_hash = null, params = null) => launchMinecraft(version_hash, params))

async function launchMinecraft(version_hash = null, params = null) {
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

        let error_out = null;
        vm.stderr.on('data', (data) => {
            error_out = data.toString('utf-8');
        })
        vm.on('close', (code) => {
            if (code != 0) {
                win.webContents.send('startup-error', error_out);
                if (socket_connector) socket_connector.send('startup-error', error_out);
            }
        })
        return true;
    } catch (error) {
        win.webContents.send('error', error.message);
        if (socket_connector) socket_connector.send('error', error.message);
    }
    return false;
}

function progress(e) {
    const progress = (e.task / e.total);
    //logger.debug(`Version hash: ${e.version_hash}`)
    //logger.debug(`Progress ${progress}`)
    win.setProgressBar(progress);
    win.webContents.send('progress', { progress: progress, version_hash: e.version_hash });
    if (socket_connector) socket_connector.send('progress', { progress: progress, version_hash: e.version_hash });
}
function download_progress(e) {
    const progress = (e.current / e.total);
    //logger.debug(`Version hash: ${e.version_hash}`)
    if (e.type != 'version-jar') return;
    //logger.debug(`Progress ${progress}`)
    win.setProgressBar(progress);
    win.webContents.send('progress', { progress: progress, version_hash: e.version_hash });
    if (socket_connector) socket_connector.send('progress', { progress: progress, version_hash: e.version_hash });
}

ipcMain.handle('installations.get', async (event, ...args) => {
    return await InstallationsManager.getInstallations();
})
ipcMain.handle('versions.get.global', async (event, ...args) => {
    return await VersionManager.getGlobalVersions();
})
ipcMain.handle('installations.create', async (event, version, options) => {
    return await InstallationsManager.createInstallation(version, options);
})
ipcMain.handle('configuration.get', async (event, ...args) => {
    return await ConfigManager.getAllOptions();
})
ipcMain.handle('configuration.set', async (event, args) => {
    return await ConfigManager.setOptions(args);
})
ipcMain.handle('system.mem', async (event, ...args) => {
    return os.totalmem() / 1024 / 1024;
})


const e_server = express_app.listen(5248);
express_app.use(express.json()) // for parsing application/json
express_app.use(function (req, res, next) {
    res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', 'https://www.tjmcraft.ga');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});
express_app.get('/ping', (req, res) => {res.send('pong')})
express_app.get('/version', (req, res) => {
    res.json({
        version: '1.8.0'
    })
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
    if (!data || !data.version || !data.options) res.json({success: false});
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
express_app.get('*', function(req, res){
    res.send({
        status: 404,
        error: `Not found`,
        success: false
    });
});

function SocketConnect(socket) {
    const sendJSON = (type = null, data) => {
        //logger.debug(data)
        socket.send(JSON.stringify({
            type: type,
            data: data
        }));
    }
    sendJSON('status', 'connected');
    this.send = function (type = null, data) {
        if (socket) sendJSON(type, data);
    }
}

const ws_server = new WebSocket.Server({
    port: 4836
});

ws_server.on('connection', function (socket) {
    socket_connector = new SocketConnect(socket);
});

function onConnect(client) {

    sendJSON('status', 'connected');
    client.on('message', function (message) {
        logger.debug(message)
        try {
            const json_message = JSON.parse(message);
            switch (json_message.action) {
                case 'get_installations':
                    InstallationsManager.getInstallations().then(i => sendJSON('get_installations', i));
                    break;
                case 'echo':
                    sendJSON('data', json_message.data);
                    break;
                case 'ping':
                    sendJSON(null, 'pong');
                    break;
                default:
                    logger.log('unknown action');
                    break;
            }
        } catch (error) {
            logger.log('Error: ', error);
        }
    });
    client.on('close', function () {
        logger.log('closed');
    });
}
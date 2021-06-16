const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const ejse = require('ejs-electron');
const path = require('path');
const url = require('url');
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
        minWidth: 800,
        minHeight: 580,
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
        icon: getPlatformIcon('icon'),
        backgroundColor: '#171614'
    })

    windowState.manage(win)

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'app', 'app.ejs'),
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
                    accelerator: isMac ? 'Alt+Cmd+D' : 'Ctrl+Shift+D',
                    click: () => openMineDir() 
                },
                {
                    label: 'Options',
                    accelerator: isMac ? 'Alt+Cmd+P' : 'Ctrl+Shift+P',
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

ipcMain.handle('ping', async (event, ...args) => {
    return (args);
})

ipcMain.handle('launch-mine', async (event, version_hash = null, params = null) => {
    try {
        const _launcher = new launcher(version_hash, params);
        _launcher.on('progress', progress);
        _launcher.on('download-status', download_progress);

        const java_path = await _launcher.getJava();
        const versionFile = await _launcher.loadManifest();
        const minecraftArguments = await _launcher.construct(versionFile);
        const vm = await _launcher.createJVM(java_path, minecraftArguments);
        
        let error_out = null;
        vm.stderr.on('data', (data) => {
            error_out = data.toString('utf-8');
        })
        vm.on('close', (code) => {
            if (code != 0) win.webContents.send('startup-error', error_out);
        })
    } catch (error) {
        win.webContents.send('error', error);
    }
    return true;
})

function progress(e) {
    const progress = (e.task / e.total);
    logger.debug(`Progress ${progress}`)
    win.setProgressBar(progress);
    win.webContents.send('progress', progress);
}
function download_progress(e) {
    const progress = (e.current / e.total);
    if (e.type != 'version-jar') return;
    logger.debug(`Progress ${progress}`)
    win.setProgressBar(progress);
    win.webContents.send('progress', progress);
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
const { app, BrowserWindow, Menu } = require('electron')
const ejse = require('ejs-electron')
const path = require('path')
const fs = require('fs')
const url = require('url')

// Disable hardware acceleration.
// https://electronjs.org/docs/tutorial/offscreen-rendering
//app.disableHardwareAcceleration()

// https://github.com/electron/electron/issues/18397
app.allowRendererProcessReuse = true

const gotTheLock = app.requestSingleInstanceLock()

let win

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // Кто-то пытался запустить второй экземпляр, мы должны сфокусировать наше окно.
      if (win) {
        if (win.isMinimized()) win.restore()
        win.focus()
      }
    })
    
    app.on('ready', createWindow)
    app.on('ready', createMenu)

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })

    app.on('activate', () => {
        if (win === null) {
            createWindow()
        }
    })
}

function createWindow () {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 500,
    frame: process.platform === 'darwin',
    webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
        enableRemoteModule: true
    },
    icon: getPlatformIcon('icon'),
    backgroundColor: '#171614'
  })

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'app', 'app.ejs'),
    protocol: 'file:',
    slashes: true
  }))

  win.once('ready-to-show', () => {
    win.show()
  })

  //win.removeMenu()

  win.resizable = true

  win.on('closed', () => {
      win = null
  })
  win.webContents.openDevTools()
}

function createMenu() {
    const isMac = process.platform === 'darwin'

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
                    click: () => {
                        win.webContents.send('open-minecraft-dir')
                    }
                },
                {
                    label: 'Options',
                    accelerator: isMac ? 'Alt+Cmd+P' : 'Ctrl+Shift+P',
                    click: () => {
                        win.webContents.send('open-settings')
                    }
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
                { role: 'forceReload'},
                { role: 'toggleDevTools', accelerator: 'F12' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn', accelerator: 'Alt+=' },
                { role: 'zoomOut', accelerator: 'Alt+-' },
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
    ]
    
    const menuObject = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menuObject)

}

function getPlatformIcon(filename){
  let ext
  switch(process.platform) {
      case 'win32':
          ext = 'ico'
          break
      case 'darwin':
          ext = 'icns'
          break
      case 'linux':
      default:
          ext = 'png'
          break
  }

  return path.join(__dirname, 'build', `${filename}.${ext}`)
}
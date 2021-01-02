const { app, BrowserWindow, Menu } = require('electron')
const ejse = require('ejs-electron')
const path = require('path')
const fs = require('fs')
const url = require('url')
const launcher = require('./app/assets/js/launcher')

// Disable hardware acceleration.
// https://electronjs.org/docs/tutorial/offscreen-rendering
app.disableHardwareAcceleration()

// https://github.com/electron/electron/issues/18397
app.allowRendererProcessReuse = true

let win

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

app.on('ready', createWindow)
app.on('ready', createMenu)

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

global.appRoot = path.resolve(__dirname)

function createMenu() {
    
  if(process.platform === 'darwin') {

      // Extend default included application menu to continue support for quit keyboard shortcut
      let applicationSubMenu = {
          label: 'Application',
          submenu: [{
              label: 'About Application',
              selector: 'orderFrontStandardAboutPanel:'
          }, {
              type: 'separator'
          }, {
              label: 'Quit',
              accelerator: 'Command+Q',
              click: () => {
                  app.quit()
              }
          }]
      }

      let minecraftMenu = {
          label: 'Minecraft',
          submenu: [{
            role: 'Minecraft Directory',
            accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+I',
            click: () => { launcher.openMineDir() }
          },
          {
            role: 'Options',
            accelerator: process.platform === 'darwin' ? 'Alt+Cmd+P' : 'Alt+Shift+P',
            click: () => {  }
          }
        ]
      }

      // New edit menu adds support for text-editing keyboard shortcuts
      let editSubMenu = {
          label: 'Edit',
          submenu: [{
              label: 'Undo',
              accelerator: 'CmdOrCtrl+Z',
              selector: 'undo:'
          }, {
              label: 'Redo',
              accelerator: 'Shift+CmdOrCtrl+Z',
              selector: 'redo:'
          }, {
              type: 'separator'
          }, {
              label: 'Cut',
              accelerator: 'CmdOrCtrl+X',
              selector: 'cut:'
          }, {
              label: 'Copy',
              accelerator: 'CmdOrCtrl+C',
              selector: 'copy:'
          }, {
              label: 'Paste',
              accelerator: 'CmdOrCtrl+V',
              selector: 'paste:'
          }, {
              label: 'Select All',
              accelerator: 'CmdOrCtrl+A',
              selector: 'selectAll:'
          }]
      }

      // Bundle submenus into a single template and build a menu object with it
      let menuTemplate = [applicationSubMenu, minecraftMenu, editSubMenu]
      let menuObject = Menu.buildFromTemplate(menuTemplate)

      // Assign it to the application
      Menu.setApplicationMenu(menuObject)

  }

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

  return path.join(__dirname, 'app', 'assets', 'images', `${filename}.${ext}`)
}
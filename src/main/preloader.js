const { shell, ipcRenderer, contextBridge } = require('electron');
const remote = require('@electron/remote')
const os = require('os');

const logger = require('./util/loggerutil')('%c[Preloader]', 'color: #a02d2a; font-weight: bold')

//logger.debug('Application loading..')

//Set Current Window as win
const win = remote.getCurrentWindow()

/**
 * Function returns current platform
 * @returns os
 */
function getOS() {
    switch (process.platform) {
        case 'win32': return 'windows'
        case 'darwin': return 'osx'
        case 'linux': return 'linux'
        default: return 'web'
    }
}

const windowEvents = {
  close: () => win.close(),
  maximize: () => win.isMaximized() ? win.unmaximize() : win.maximize(),
  minimize: () => win.minimize(),
  restore: () => win.restore(),
  blur: () => win.blur(),
  focus: () => win.focus(),
  fullscreen: () => win.fullscreen(),
  setProgressBar: (e) => win.setProgressBar(e),
  setZoomFactor: (e) => win.webContents.setZoomFactor(e),
};

document.addEventListener('readystatechange', function () {
    if (document.readyState === 'interactive'){
        logger.debug('Initializing..')
        if (win.isFullScreen()) enterFullScreen()
    } else if (document.readyState === 'complete') {
        if (process.platform !== 'darwin') {
            document.querySelector('.fCb')?.addEventListener('click', (e) => win.close())
            document.querySelector('.fRb')?.addEventListener('click', (e) => win.isMaximized() ? win.unmaximize() : win.maximize())
            document.querySelector('.fMb')?.addEventListener('click', (e) => win.minimize())
        }
    }
    win.setProgressBar(-1)
})

function enterFullScreen () {
    document.documentElement.classList.add('fullscreen')
}
function leaveFullScreen () {
    document.documentElement.classList.remove('fullscreen')
}
function windowBlur () {
    document.documentElement.classList.add('blur')
}
function windowFocus () {
    document.documentElement.classList.remove('blur')
}

process.once('loaded', () => {
  contextBridge.exposeInMainWorld('electron', {
    on (eventName, callback) {
      ipcRenderer.on(eventName, callback)
    },
    async invoke (eventName, ...params) {
      return await ipcRenderer.invoke(eventName, ...params)
    },
    async shellOpenExternal (url) {
      await shell.openExternal(url)
    },
    async shellOpenPath (file) {
      await shell.openPath(file)
    },
    async shellTrashItem (file) {
      await shell.trashItem(file)
    }
  })
})

contextBridge.exposeInMainWorld('__STANDALONE__', true)
contextBridge.exposeInMainWorld('system', {
    os: getOS()
})
contextBridge.exposeInMainWorld('tjmcNative', {
  window: {
    close: windowEvents.close,
    maximize: windowEvents.maximize,
    minimize: windowEvents.minimize,
    restore: windowEvents.restore,
    blur: windowEvents.blur,
    focus: windowEvents.focus,
    fullscreen: windowEvents.fullscreen,
    setProgressBar: windowEvents.setProgressBar,
    setZoomFactor: windowEvents.setZoomFactor,
  },
  os: {
    release: os.release(),
    arch: os.arch(),
  },
  app: {
    getVersion: remote.app.getVersion,
    relaunch: remote.app.relaunch,
    version: remote.process.versions,
  },
  process: {
    platform: remote.process.platform,
    arch: remote.process.arch,
    env: remote.process.env, 
  },
  ipc: {
    send: ipcRenderer.send,
    on: ipcRenderer.on,
    invoke: ipcRenderer.invoke,
  }
})

// Init global instances
process.once('loaded', () => {
    ipcRenderer.on('enter-full-screen', enterFullScreen)
    ipcRenderer.on('leave-full-screen', leaveFullScreen)
    ipcRenderer.on('blur', windowBlur)
    ipcRenderer.on('focus', windowFocus)
})

/**
 * Open web links in the user's default browser.
 */
document.addEventListener('click', (event) => {
    if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
        event.preventDefault()
        shell.openExternal(event.target.href)
    }
})
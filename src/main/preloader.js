const { shell, ipcRenderer, contextBridge } = require('electron')
const logger = require('./util/loggerutil')('%c[Preloader]', 'color: #a02d2a; font-weight: bold')
const remote = require('@electron/remote')
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
    os: getOS(),
    colorScheme: null
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
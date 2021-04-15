const ConfigManager = require('./libs/ConfigManager')
const { shell, remote, ipcRenderer } = require('electron')
const VersionManager = require('./libs/VersionManager')
const launcher      = require('./launcher')
const logger        = require('./loggerutil')('%c[Preloader]', 'color: #a02d2a; font-weight: bold')

//logger.debug('Application loading..')

// Load ConfigManager
ConfigManager.load()

//Set Current Window as win
const win = remote.getCurrentWindow()

// Init global instances
process.once('loaded', () => {
    /**
     * Global API
     */
    global.API = {
        ConfigManager: ConfigManager,
        VersionManager: VersionManager,
        launcher: launcher,
        getOS: getOS,
        shell: shell,
        ipc: ipcRenderer,
        window: win
    }

    ipcRenderer.on('open-settings', () => {
        openSettings()
    })
    ipcRenderer.on('open-minecraft-dir', () => {
        launcher.openMineDir()
    })

    ipcRenderer.on('enter-full-screen', enterFullScreen)
    ipcRenderer.on('leave-full-screen', leaveFullScreen)

    ipcRenderer.on('blur', windowBlur)
    ipcRenderer.on('focus', windowFocus)
})

/**
 * Function returns current platform
 */
function getOS() {
    switch (process.platform) {
        case 'win32': return 'windows'
        case 'darwin': return 'osx'
        case 'linux': return 'linux'
        default: return 'unknown_os'
    }
}

document.addEventListener('readystatechange', function () {
    if (document.readyState === 'interactive'){

        logger.debug('Initializing..')

        if (win.isFullScreen()) enterFullScreen()

        if (process.platform !== 'darwin') {
            document.querySelector('.fCb').addEventListener('click', (e) => {
                win.close()
            })
            document.querySelector('.fRb').addEventListener('click', (e) => {
                win.isMaximized() ? win.unmaximize() : win.maximize()
            })
            document.querySelector('.fMb').addEventListener('click', (e) => {
                win.minimize()
            })
        }

        switch (API.getOS()) {
            case 'windows':
                document.documentElement.classList.add('platform-win')
                break;
            case 'osx':
                document.documentElement.classList.add('platform-darwin')
                break;
            case 'linux':
                document.documentElement.classList.add('platform-linux')
                break;    
            default:
                break;
        }
    }
})

function enterFullScreen () {
    document.body.classList.add('fullscreen')
}
function leaveFullScreen () {
    document.body.classList.remove('fullscreen')
}
function windowBlur () {
    document.body.classList.add('blur')
}
function windowFocus () {
    document.body.classList.remove('blur')
}
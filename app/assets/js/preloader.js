const ConfigManager = require('./libs/ConfigManager')
ConfigManager.load()
const { shell, ipcRenderer } = require('electron')
const VersionManager = require('./libs/VersionManager')
VersionManager.updateGlobalVersionsConfig()
const launcher      = require('./launcher')
const WebSocket = require('ws')
const logger = require('./loggerutil')('%c[Preloader]', 'color: #a02d2a; font-weight: bold')
const remote = require('@electron/remote')
//logger.debug('Application loading..')

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
        window: win
    }

    global.__STANDALONE__ = true

    ipcRenderer.on('open-settings', () => {
        openSettings()
    })
    ipcRenderer.on('open-minecraft-dir', openMineDir)

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

        switch (getOS()) {
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

        win.setProgressBar(0)
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

function openMineDir() {
    const path = ConfigManager.getDataDirectory();
    logger.debug('Using default path: '+path)
    shell.openPath(path);
}

const ws_server = new WebSocket.Server({port: 5248});
ws_server.on('connection', onConnect);
function onConnect(wsClient) {
    wsClient.send('hello world!');
    wsClient.on('message', function(message) {
        logger.debug(message)
        try {
            const jsonMessage = JSON.parse(message);
            switch (jsonMessage.action) {
              case 'echo':
                wsClient.send(jsonMessage.data);
                break;
              case 'ping':
                wsClient.send('pong');
                break;
              default:
                logger.log('unknown action');
                break;
            }
          } catch (error) {
            logger.log('Error: ', error);
          }
    });
    wsClient.on('close', function() {
      logger.log('closed');
    });
}
const ConfigManager = require('./libs/ConfigManager')
ConfigManager.load()
const { shell, ipcRenderer, contextBridge } = require('electron')
const VersionManager = require('./libs/VersionManager')
VersionManager.updateGlobalVersionsConfig()
const launcher      = require('./launcher')
const WebSocket = require('ws')
const app = require('express')()
const logger = require('./loggerutil')('%c[Preloader]', 'color: #a02d2a; font-weight: bold')
const remote = require('@electron/remote')
//logger.debug('Application loading..')

//Set Current Window as win
const win = remote.getCurrentWindow()

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

function startMine(props = null, progress_callback = () => {}, download_callback = () => {}, error_callback = () => {}, startup_error_callback = () => {}) {
    const _launcher = new launcher(props);
    _launcher.on('progress', (e) => progress_callback(e))
    _launcher.on('download-status', (e) => download_callback(e))
    _launcher.construct().then(([java, minecraftArguments]) => {
        _launcher.createJVM(java, minecraftArguments).then((minecraft) => {
            //topBar.toggle(false)
            let error_out;
            minecraft.stderr.on('data', (data) => {
                error_out = data.toString('utf-8');
            })
            minecraft.on('close', (code) => {
                if (code != 0) startup_error_callback(error_out);
            })
        })
    }).catch(e => error_callback(e))
    return _launcher;
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

contextBridge.exposeInMainWorld('API', {
    ConfigManager: ConfigManager,
    VersionManager: VersionManager,
    launcher: launcher,
    Launch: startMine,
    getOS: getOS,
    setProgressBar: (v) => win.setProgressBar(v/100)
})

// Init global instances
process.once('loaded', () => {
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

/*const ws_server = new WebSocket.Server({port: 5248});
ws_server.on('connection', onConnect);
function onConnect(client) {
    const sendJSON = (type = null, data) => {
        client.send(JSON.stringify({ type: type, data: data }));
    }
    client.send(JSON.stringify({
        status: 'connected'
    }));
    client.on('message', function(message) {
        logger.debug(message)
        try {
            const json_message = JSON.parse(message);
            switch (json_message.action) {
                case 'get_installations':
                    VersionManager.getInstallations().then(i => sendJSON('get_installations', i));
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
    client.on('close', function() {
        logger.log('closed');
    });
}*/

const e_server = app.listen(5248);
app.use(function (req, res, next) {
    res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*')
    next();
});
app.get('/ping', (req, res) => {res.send('pong')})
app.get('/version', (req, res) => {
    res.json({
        version: '1.0.0.0'
    })
});
app.get('/get/installations', (req, res) => {
    VersionManager.getInstallations().then(i => res.json(i));
});
app.get('/get/installation', (req, res) => {
    (!req.query.hash) && res.json({ error: 'no hash in params', params: req.query }, 404);
    VersionManager.getInstallation(req.query.hash).then(i => res.json(i));
});
app.get('/get/globalVersions', (req, res) => {
    VersionManager.getGlobalVersions().then(i => res.json(i));
});
app.get('/get/config/version', (req, res) => {
    ConfigManager.getVersion().then(i => res.json(i));
});
app.get('*', function(req, res){
    res.send({
        status: 404,
        error: `Not found`
    });
});
const { shell, ipcRenderer, contextBridge } = require('electron')
//const WebSocket = require('ws')
//const app = require('express')()
const logger = require('./loggerutil')('%c[Preloader]', 'color: #a02d2a; font-weight: bold')
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

        if (process.platform !== 'darwin') {
            document.querySelector('.fCb')?.addEventListener('click', (e) => {
                win.close()
            })
            document.querySelector('.fRb')?.addEventListener('click', (e) => {
                win.isMaximized() ? win.unmaximize() : win.maximize()
            })
            document.querySelector('.fMb')?.addEventListener('click', (e) => {
                win.minimize()
            })
        }

        win.setProgressBar(-1)
    }
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
    client.on('close', function() {
        logger.log('closed');
    });
}*/

/*const e_server = app.listen(5248);
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
    InstallationsManager.getInstallations().then(i => res.json(i));
});
app.get('/get/installation', (req, res) => {
    (!req.query.hash) && res.json({ error: 'no hash in params', params: req.query }, 404);
    InstallationsManager.getInstallation(req.query.hash).then(i => res.json(i));
});
app.get('/get/globalVersions', (req, res) => {
    VersionManager.getGlobalVersions().then(i => res.json(i));
});
app.get('*', function(req, res){
    res.send({
        status: 404,
        error: `Not found`
    });
});*/
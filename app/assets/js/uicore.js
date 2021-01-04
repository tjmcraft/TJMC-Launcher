const {ipcRenderer, remote, shell, webFrame} = require('electron')
const LoggerUtil = require('./assets/js/loggerutil')
const Message = require('./assets/js/message')
const request = require('request')
const fs = require('fs')
const path = require('path')
const Minecraft = require('./assets/js/Minecraft')
const client = require('./assets/js/launcher')
const appLayers = require('./assets/js/appLayers')
const launcher = require('./assets/js/launcher')
const {escBinder, toggleButtonBinder} = require('./assets/js/uibind')
const ConfigManager = require('./assets/js/ConfigManager')

const logg = LoggerUtil('%c[UICore]', 'color: #00aeae; font-weight: bold')

webFrame.setZoomLevel(0)
webFrame.setVisualZoomLevelLimits(1, 1)

document.addEventListener('readystatechange', function () {
    if (document.readyState === 'interactive'){
        const window = remote.getCurrentWindow()
        let Layers = new appLayers()

        /* ================================= */
        const versionList = document.querySelector('#version')
        const topBar = document.querySelector('#topBar')
        const progressBar = document.querySelector('#progress-bar')
        const nickField = document.querySelector('#nick')
        const playButton = document.querySelector('#playButton')
        /* ================================= */
        
        logg.log('UICore Initializing..')

        Layers.openMain()
        track(window)

        if (window.isFullScreen()) {
            document.body.classList.add('fullscreen')
        }

        ipcRenderer.on('open-settings', function() {
            Layers.openSettings()
        })
        ipcRenderer.on('open-minecraft-dir', function() {
            launcher.openMineDir()
        })

        if (process.platform !== 'darwin') {
            document.querySelector('.fCb').addEventListener('click', e => {
                window.close()
            })
            document.querySelector('.fRb').addEventListener('click', e => {
                window.isMaximized() ? window.unmaximize() : window.maximize()
            })
            document.querySelector('.fMb').addEventListener('click', e => {
                window.minimize()
            })
        } else {
            document.body.classList.add('darwin')
        }
// =================================================================
        versionList.addVer = function (val){
            option = document.createElement( 'option' );
            option.value = option.text = val;
            versionList.add( option );
        }

        progressBar.setValue = (v) => {
            progressBar.style.width = v + "%"
            window.setProgressBar(v/100)
        }

        nickField.oninput = function(e){
            console.log(e.target.value)
        }

        Minecraft.getVersionManifest.then(parsed => {
            for (const cv in parsed) {
                versionList.addVer(parsed[cv].id)
            }
        })

        playButton.addEventListener('click', (e) => {
            startMine()
        })
        // ----------------------------------
        function startMine () {
            let launcher = new client(ConfigManager.getAllOptions())
            launcher.on('progress', (e) => {
                progressBar.setValue((e.task/e.total)*100)
            })
            launcher.on('download-status', (e) => {
                if (e.type == 'version-jar') {progressBar.setValue((e.current/e.total)*100)}
            })
            topBar.toggle(true)
            launcher.construct().then((minecraftArguments) =>
                launcher.createJVM(minecraftArguments).then((e) => {
                    topBar.toggle(false)
                })
            )
        }
    } else if (document.readyState === 'complete'){
        setTimeout(() => {
            document.body.classList.remove('preload')
            document.querySelector('#preloader').remove()
        }, 1000)
    }
})

function track(win) {
    win.on('enter-full-screen', (e) => {
        document.body.classList.add('fullscreen')
    })
    win.on('leave-full-screen', (e) => {
        document.body.classList.remove('fullscreen')
    })
}

/**
 * Open web links in the user's default browser.
 */
document.addEventListener('click', function (event) {
    if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
      event.preventDefault()
      shell.openExternal(event.target.href)
    }
  })

/**
 * Functions toogle all elements using css
 * @param {boolean} s state to toggle (it can be null)
 */
Element.prototype.toggle = function(s = null) {
    let cl = this.classList,
        c = 'hidden'
    if (s != null ? s : cl.contains(c) == 1){
        cl.remove(c)
    } else {
        cl.add(c)
    }
}
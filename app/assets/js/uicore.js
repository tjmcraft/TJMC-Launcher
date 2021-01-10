const {ipcRenderer, remote, shell, webFrame} = require('electron')
const LoggerUtil = require('./loggerutil')
const Minecraft = require('./Minecraft')
const client = require('./launcher')
const launcher = require('./launcher')
const ConfigManager = require('./ConfigManager')
const { fadeIn, fadeOut } = require('./libs/Animation')
const Settings = require('./settings')

const logg = LoggerUtil('%c[UICore]', 'color: #00aeae; font-weight: bold')

document.addEventListener('readystatechange', function () {
    if (document.readyState === 'interactive'){
        let c_window = remote.getCurrentWindow()
        //let Layers = new appLayers()

        /* ================================= */
        const versionList = document.querySelector('#version')
        const topBar = document.querySelector('#topBar')
        const progressBar = document.querySelector('#progress-bar')
        const nickField = document.querySelector('#nick')
        const playButton = document.querySelector('#playButton')
        /* ================================= */
        
        logg.log('UICore Initializing..')

        //Layers.openMain()

        ipcRenderer.on('open-settings', () => {
            //Layers.openSettings()
            switchView(VIEWS.settings, 35, 35, () => {
                new Settings()
            })
        })
        ipcRenderer.on('open-minecraft-dir', () => {
            launcher.openMineDir()
        })
        ipcRenderer.on('enter-full-screen', enterFullScreen)
        ipcRenderer.on('leave-full-screen', leaveFullScreen)

        if (process.platform !== 'darwin') {
            document.querySelector('.fCb').addEventListener('click', e => {
                c_window.close()
            })
            document.querySelector('.fRb').addEventListener('click', e => {
                c_window.isMaximized() ? c_window.unmaximize() : c_window.maximize()
            })
            document.querySelector('.fMb').addEventListener('click', e => {
                c_window.minimize()
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
        Minecraft.getVersionManifest.then((parsed) => {
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
        switchView(VIEWS.landing, 100, 100)
        setTimeout(() => {
            document.body.classList.remove('preload')
            document.querySelector('#preloader').remove()
        }, 1000)
    }
})

function enterFullScreen () {
    document.body.classList.add('fullscreen')
}
function leaveFullScreen () {
    document.body.classList.remove('fullscreen')
}
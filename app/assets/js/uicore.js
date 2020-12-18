const $                                      = require('jquery')
const {ipcRenderer, remote, shell, webFrame} = require('electron')
const LoggerUtil                             = require('./assets/js/loggerutil')
const request                                = require('request')

const loggerUICore             = LoggerUtil('%c[UICore]', 'color: #000668; font-weight: bold')
const loggerAutoUpdater        = LoggerUtil('%c[AutoUpdater]', 'color: #000668; font-weight: bold')
const loggerAutoUpdaterSuccess = LoggerUtil('%c[AutoUpdater]', 'color: #209b07; font-weight: bold')

document.addEventListener('readystatechange', function () {
    if (document.readyState === 'interactive'){
        loggerUICore.log('UICore Initializing..')

        // Bind close button.
        Array.from(document.getElementsByClassName('fCb')).map((val) => {
            val.addEventListener('click', e => {
                const window = remote.getCurrentWindow()
                window.close()
            })
        })

        // Bind restore down button.
        Array.from(document.getElementsByClassName('fRb')).map((val) => {
            val.addEventListener('click', e => {
                const window = remote.getCurrentWindow()
                if(window.isMaximized()){
                    window.unmaximize()
                } else {
                    window.maximize()
                }
                document.activeElement.blur()
            })
        })

        // Bind minimize button.
        Array.from(document.getElementsByClassName('fMb')).map((val) => {
            val.addEventListener('click', e => {
                const window = remote.getCurrentWindow()
                window.minimize()
                document.activeElement.blur()
            })
        })
    }
});

getVersionDataUrl('1.16.4').then(data => {
    console.log(data);
})

    function loadMojangLauncherData(){
        return new Promise((resolve, reject) => {
            request.get('https://launchermeta.mojang.com/mc/launcher.json', (err, resp, body) => {
                if(err){
                    resolve(null)
                } else {
                    resolve(JSON.parse(body))
                }
            })
        })
    }

    function getVersionDataUrl(version){
        return new Promise((resolve, reject) => {
            request('https://launchermeta.mojang.com/mc/game/version_manifest.json', (error, resp, body) => {
                if(error){
                    reject(error)
                } else {
                    const manifest = JSON.parse(body)

                    for(let v of manifest.versions){
                        if(v.id === version){
                            resolve(v.url)
                        }
                    }

                    resolve(null)
                }
            })
        })
    }

    function addVer(select, val){
        option = document.createElement( 'option' );
        option.value = option.text = val;
        select.add( option );
    }
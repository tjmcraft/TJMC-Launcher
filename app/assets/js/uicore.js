const $                                      = require('jquery')
const {ipcRenderer, remote, shell, webFrame} = require('electron')
const LoggerUtil                             = require('./assets/js/loggerutil')
const request                                = require('request')
const fs                                     = require('fs')
const path                                   = require('path')
const {Minecraft}                       = require('./assets/js/Minecraft')
const launcher                               = require('./assets/js/launcher')
const logg = LoggerUtil('%c[UICore]', 'color: #00aeae; font-weight: bold')

document.addEventListener('readystatechange', function () {

    if (document.readyState === 'interactive'){
        version_list = document.getElementById('version')
        
        logg.log('UICore Initializing..')
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
        // =================================================================

        version_list.addVer = function (val){
            option = document.createElement( 'option' );
            option.value = option.text = val;
            version_list.add( option );
        }
        document.getElementById('nick').oninput = function(e){
            console.log(e.target.value)
        }
        Minecraft.getVersionManifest.then(parsed => {
            //logg.log(parsed)
            for (const cv in parsed) {
                version_list.addVer(parsed[cv].id);
            }
            //version_list.value = parsed.release;
        })
    }
});


function setBar(percentage) {
    document.getElementById('bar').style.width = percentage + "%"
}
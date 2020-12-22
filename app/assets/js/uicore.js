const $                                      = require('jquery')
const {ipcRenderer, remote, shell, webFrame} = require('electron')
const LoggerUtil                             = require('./assets/js/loggerutil')
const request                                = require('request')
const fs                                     = require('fs')
const path                                   = require('path')
const logg = LoggerUtil('%c[UICore]', 'color: #000668; font-weight: bold')

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
            for (const cv in parsed.versions) {
                version_list.addVer(parsed.versions[cv].id);
            }
            version_list.value = parsed.latest.release
        })
    }
});



class Minecraft {
    constructor () {
        this.options = {
            root: require('electron').remote.app.getPath('userData')+'/minecraft',
            url: {
                version_manifest: `https://launchermeta.mojang.com/mc/game/version_manifest.json`,
                resource: "https://resources.download.minecraft.net"
            }
        }
    }
    static get getAppData(){
        return path.normalize((process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share"))+'/TJMC-Launcher') || require('electron').remote.app.getPath('userData')
    }
    static get getVersionManifest () {
        return new Promise(resolve => {
            request.get(`https://launchermeta.mojang.com/mc/game/version_manifest.json`, (error, response, body) => {
                if (error) resolve(error)
                const parsed = JSON.parse(body)
                return resolve(parsed)
            })
        })
    }
    getVersion (version) {
        return new Promise(resolve => {
            const versionJsonPath = path.join(path.join(this.options.root, 'versions', version), `${version}.json`)
            console.log(versionJsonPath);
            if (fs.existsSync(versionJsonPath)) {
                this.version = JSON.parse(fs.readFileSync(versionJsonPath))
                return resolve(this.version)
            }
            
            this.constructor.getVersionManifest.then(parsed => {
                for (const cv in parsed.versions) {
                    if (parsed.versions[cv].id === version) {
                        request.get(parsed.versions[cv].url, (error, response, body) => {
                            if (error) resolve(error)
                            this.version = JSON.parse(body)
                            return resolve(this.version)
                        })
                    }
                }
            })
        })
    }
}
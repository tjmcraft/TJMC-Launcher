const $                                      = require('jquery')
const {ipcRenderer, remote, shell, webFrame} = require('electron')
const LoggerUtil                             = require('./assets/js/loggerutil')
const request                                = require('request')
const fs                                     = require('fs')
const path                                   = require('path')
const {Minecraft}                            = require('./assets/js/Minecraft')
const client                               = require('./assets/js/launcher')

const logg = LoggerUtil('%c[UICore]', 'color: #00aeae; font-weight: bold')

document.addEventListener('readystatechange', function () {
    const window = remote.getCurrentWindow()
    if (document.readyState === 'interactive'){

        /* ================================= */
        const versionList = document.querySelector('#version')
        const topBar = document.querySelector('#topBar')
        const progressBar = document.querySelector('#progress-bar')
        const nickField = document.querySelector('#nick')
        const playButton = document.querySelector('#playButton')
        /* ================================= */
        
        logg.log('UICore Initializing..')
        // Bind close button.
        Array.from(document.getElementsByClassName('fCb')).map((val) => {
            val.addEventListener('click', e => {
                window.close()
            })
        })
        // Bind restore down button.
        Array.from(document.getElementsByClassName('fRb')).map((val) => {
            val.addEventListener('click', e => {
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
                window.minimize()
                document.activeElement.blur()
            })
        })
        // =================================================================
        versionList.addVer = function (val){
            option = document.createElement( 'option' );
            option.value = option.text = val;
            versionList.add( option );
        }

        // ==========  progressBar ========== 

        progressBar.setValue = (v) => {
            progressBar.style.width = v + "%"
            window.setProgressBar(v/100)
        }

        // ----------------------------------

        nickField.oninput = function(e){
            console.log(e.target.value)
        }

        Minecraft.getVersionManifest.then(parsed => {
            for (const cv in parsed) {
                versionList.addVer(parsed[cv].id)
            }
            //versionList.value = parsed.release
        })

        playButton.addEventListener('click', (e) => {
            startMine()
        })
        // ----------------------------------
        function startMine () {
            let launcher = new client()
            launcher.on('progress', (e) => {
                progressBar.setValue((e.task/e.total)*100)
            })
            launcher.on('download-status', (e) => {
                if (e.type == 'version-jar') {progressBar.setValue((e.current/e.total)*100)}
            })
            topBar.toggle(true)
            launcher.construct().then((e) => {
                topBar.toggle(false)
            })
            
        }
    }
});




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



class overlay {
    constructor (header = null, text = null, type = null, closeButton = null, okButton = null) {
        if (document.querySelector('#overlay')) {
            document.querySelector('#overlay').toggle() 
            setTimeout(()=>{
                document.querySelector('#overlay').remove()
            }, 1000)
        }

        this.overlay = this.createElementWithId('div', 'overlay')
        this.overlay.toggle(false)

        let container = this.createElementWithId('div', 'container')
        container.onclick = (event) => {event.stopPropagation()}

        if (closeButton) {
            let tools = this.createToolsContainer(null, null)
            tools.querySelector('#overlayCloseButton').onclick = () => {
                this.destroy()
            }
            container.append(tools)
        }

        if (type) {
            let path = null
            switch (type) {
                case 'info':
                    path = './app/assets/css/info-circle.svg'
                    break
                case 'error':
                    path = './app/assets/css/error-circle.svg'
                    break
                case 'warn':
                    path = './app/assets/css/warn-circle.svg'
                    break
                case 'success':
                    path = './app/assets/css/success-circle.svg'
                    break
                default:
                    path = ''
                    break                
            }
            
            let data = fs.readFileSync(path, 'utf8')
                
            let img = document.createElement('h2')
            img.innerHTML = data
            
            container.append(img)
        }

        if (header){
            let h = document.createElement('h1')
            h.innerText = header
            container.append(h)
        }

        if (text) {
            let p = document.createElement('p')
            p.innerText = text
            container.append(p)
        }

        if (okButton) {
            let button = this.createElementWithClass('button', 'okButton')
            button.innerText = 'Ок'
            button.onclick = () => {
                this.destroy()
            }
            container.append(button)
        }

        this.overlay.onclick = (e) => {
            this.destroy()
        }

        document.onkeydown = (evt) => {
            evt = evt || window.event
            let isEscape = false
            if ("key" in evt) {
                isEscape = (evt.key === "Escape" || evt.key === "Esc")
            } else {
                isEscape = (evt.keyCode === 27)
            }
            if (isEscape) {
                this.destroy()
            }
        }

        this.overlay.append(container)

        document.body.appendChild(this.overlay)
        setTimeout(() => {
            this.overlay.toggle(true)
        })
        
        return this.overlay
    }

    createElementWithId (el, id) {
        let e = document.createElement(el)
        e.id = id
        return e
    }

    createElementWithClass (el, cl) {
        let e = document.createElement(el)
        e.className = cl
        return e
    }

    createToolsContainer (image = null, key = null) {
        let tools = this.createElementWithClass('div', 'tools')
        let cont = this.createElementWithClass('div', 'container')

        let overlayCloseButton = this.createElementWithId('div', 'overlayCloseButton')

        let img = document.createElement('img')
        img.src = "./assets/css/cross.svg"

        let keycode = this.createElementWithClass('div', 'keycode')
        keycode.innerText = 'ESC'

        overlayCloseButton.append(img)
        cont.innerHTML += overlayCloseButton.outerHTML + keycode.outerHTML

        tools.append(cont)
        
        return tools
    }

    destroy () {
        this.overlay.toggle(false)
        setTimeout(() => {
            this.overlay.remove();
        }, 500)
    }
}
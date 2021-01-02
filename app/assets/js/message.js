const fs = require('fs')

class message {
    constructor(params) {
        let oldOverlay = document.querySelector('#overlay')
        if (oldOverlay) {
            oldOverlay.toggle(false)
            setTimeout(() => {
                oldOverlay.remove()
            }, 1000)
        }

        this.overlay = this.createOverlay(params.closeButton)
        this.overlay.toggle(false)

        let container = this.createElementWithId('div', 'container')
        container.onclick = (event) => {event.stopPropagation()}

        if (params.type) {
            let data = null
            switch (params.type) {
                case 'info':
                    data = '<svg width="96" height="96" aria-hidden="true" focusable="false" data-prefix="far" data-icon="info-circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-info-circle fa-w-16 fa-9x"><path fill="currentColor" d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm0-338c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z" class=""></path></svg>'
                    break
                case 'error':
                    data = '<svg width="96" height="96" aria-hidden="true" focusable="false" data-prefix="far" data-icon="error-circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-times-circle fa-w-16 fa-9x"><path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z" class=""></path></svg>'
                    break
                case 'warn':
                    data = '<svg width="96" height="96" aria-hidden="true" focusable="false" data-prefix="far" data-icon="warn-circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-exclamation-circle fa-w-16 fa-9x"><path fill="currentColor" d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm42-104c0 23.159-18.841 42-42 42s-42-18.841-42-42 18.841-42 42-42 42 18.841 42 42zm-81.37-211.401l6.8 136c.319 6.387 5.591 11.401 11.985 11.401h41.17c6.394 0 11.666-5.014 11.985-11.401l6.8-136c.343-6.854-5.122-12.599-11.985-12.599h-54.77c-6.863 0-12.328 5.745-11.985 12.599z" class=""></path></svg>'
                    break
                case 'success':
                    data = '<svg width="96" height="96" aria-hidden="true" focusable="false" data-prefix="far" data-icon="success-circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-check-circle fa-w-16 fa-9x"><path fill="currentColor" d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267l-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z" class=""></path></svg>'
                    break
                default:
                    data = ''
                    break
            }
            if (data) {
                let ie = document.createElement('h2')
                ie.innerHTML += data
                container.append(ie)
            }
        }

        if (params.header) {
            let h = document.createElement('h1')
            h.innerHTML = params.header
            container.append(h)
        }

        if (params.text) {
            let p = document.createElement('p')
            p.innerHTML = params.text
            container.append(p)
        }

        if (params.buttons) {
            let hr = document.createElement('hr')
            container.append(hr)
            for (let bp of params.buttons) {
                let button = this.createElementWithClass('button', bp.class ? bp.class : '')
                button.innerText = bp.name
                button.onclick = () => {
                    if (bp.callback && typeof bp.callback === 'function') {
                        bp.callback()
                    }
                    if (bp.closeOverlay) this.destroy()
                }
                container.append(button)
            }
        }

        this.overlay.onclick = (e) => {
            this.destroy()
        }

        document.onkeyup = (evt) => {
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

    createElementWithId(el, id) {
        let e = document.createElement(el)
        e.id = id
        return e
    }

    createElementWithClass(el, cl) {
        let e = document.createElement(el)
        e.className = cl
        return e
    }

    createOverlay(closeButton = null){
        let overlay = this.createElementWithId('div', 'overlay')

        if (closeButton) {
            let tools = this.createToolsContainer()
            tools.querySelector('#overlayCloseButton').onclick = () => {
                this.destroy()
            }
            overlay.append(tools)
        }
        
        return overlay
    }

    createToolsContainer() {
        let tools = this.createElementWithClass('div', 'tools')
        let overlayCloseButton = this.createElementWithId('div', 'overlayCloseButton')
        let cross = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#dcddde" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"></path></svg>'
        let keycode = this.createElementWithClass('div', 'keycode')
        keycode.innerText = 'ESC'

        overlayCloseButton.innerHTML += cross
        tools.append(overlayCloseButton, keycode)

        return tools
    }

    destroy() {
        this.overlay.toggle(false)
        setTimeout(() => {
            this.overlay.remove()
        }, 500)
        document.onkeyup = null
    }
}

module.exports = message
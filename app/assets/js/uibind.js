class escBinder {
    constructor () {
        this.Lonkeyup = null
    }
    bind (f) {
        this.Lonkeyup = document.onkeyup
        document.onkeyup = (e) => {
            e = e || window.event
            if (((e.key === "Escape" || e.key === "Esc" || e.keyCode === 27) || false) && typeof f === 'function') f()
        }
    }
    uibind () {
        document.onkeyup = this.Lonkeyup
    }
}

class toggleButtonBinder {
    constructor (b) {
        this.button = b
    }
    bind (f) {
        this.button.onclick = (e) => {
            typeof f === 'function' ? f(this.button.checked) : ''
        }
    }
    unbind () {
        this.button.onclick = null
        this.button = null
    }
}

module.exports = {escBinder, toggleButtonBinder}
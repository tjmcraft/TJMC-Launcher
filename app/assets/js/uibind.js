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

module.exports = {escBinder}
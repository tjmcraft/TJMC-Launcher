class appLayers {
    constructor() {
        this.appMount = document.querySelector('#app-mount')
        this.layers = this.appMount.querySelectorAll('.app-layer')
    }
    setActive(l) {
        for (let layer of this.layers) {
            layer.classList.remove('active')
            if (layer.id == l)
                layer.classList.add('active')
        }
    }
    openSettings() {
        this.setActive('frameSecond')
    }
    openMain() {
        this.setActive('frameMain')
    }
}
module.exports = appLayers
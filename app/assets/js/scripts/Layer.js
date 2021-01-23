class Layer {
    /**
     * 
     * @param {Object} options - The options object
     * @param {String} options.label - Label of layer
     * @param {Number} options.fadeTime - Time to switch between layers
     */
    constructor(options = {}) {
        this.options = options
        this.label = this.options.label || `layer-${randomString(5)}`
        this.appLayers = qsl('.app-layers')
        this.layer = createElementWithClass('div', 'layer')
        this.layer.setAttribute('aria-label', `${this.label}`)
        if (qsl(`[aria-label=${this.label}]`)) return
    }
    join(callback = () => {}) {
        this.layer.style.opacity = 0
        if (qsl(`[aria-label=${this.label}]`)) return
        this.appLayers.append(this.layer)
        callback()
    }
    show(callback = () => {}) {
        this.pView = getCurrentView()
        let fadeTime = this.options.fadeTime || 150
        if (!qsl(`[aria-label=${this.label}]`)) this.join()
        this.layer.style.visibility = 'visible'
        switchView(this.layer, fadeTime, fadeTime, () => {}, callback)
    }
    hide(callback = () => {}) {
        let fadeTime = this.options.fadeTime || 150
        this.layer.style.visibility = 'hidden'
        switchView(this.pView, fadeTime, fadeTime, () => {}, callback)
    }
    destroy(callback = () => {}) {
        this.hide(() => {
            this.layer.remove()
            callback()
        })
    }
    append(content) {
        this.layer.append(content)
    }
    removeChild(content) {
        this.layer.removeChild(content)
    }
    content() {
        return this.layer
    }
}
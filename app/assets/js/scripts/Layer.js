class Layer {
    /**
     * 
     * @param {Object} options - The options object
     * @param {String} options.label - Label of layer
     * @param {Number} options.fadeTime - Time to switch between layers
     */
    constructor(options = {}) {
        this.options = options
        this.label = this.options.label || `layer-${randomInteger(0,999)}`
        if (qsl(`[aria-label=${this.label}]`)) return
        this.pView = getCurrentView()
        this.appLayers = qsl('.app-layers')
        this.layer = createElementWithClass('div', 'layer')
        this.layer.setAttribute('aria-label', `${this.label}`)
        return this.layer
    }
    join() {
        this.layer.style.opacity = 0
        this.appLayers.append(this.layer)
    }
    show() {
        let fadeTime = this.options.fadeTime || 150
        this.join()
        switchView(this.layer, fadeTime, fadeTime)
    }
}
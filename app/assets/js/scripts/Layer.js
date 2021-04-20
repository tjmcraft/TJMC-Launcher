/**
 * Class Layer creates new layer container
 * with all functions to control it
 * - join
 * - show
 * - hide
 * - destroy
 * - append
 * - removeChild
 * - get content
 */
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
        this.layer = createElement('div', {class: 'layer'})
        this.layer.setAttribute('aria-label', `${this.label}`)
        if (qsl(`[aria-label=${this.label}]`)) throw new Error('Layer is already exist!')
    }
    /**
     * Join created layer to appLayers container
     * @param {Function} callback 
     */
    join(callback = () => {}) {
        this.layer.style.opacity = 0
        if (qsl(`[aria-label=${this.label}]`)) return
        this.appLayers.append(this.layer)
        callback()
    }
    /**
     * Show created layer
     * @param {Function} callback 
     */
    show(callback = () => {}) {
        this.pView = getCurrentView()
        let fadeTime = this.options.fadeTime || 150
        if (!qsl(`[aria-label=${this.label}]`)) this.join()
        this.layer.style.visibility = 'visible'
        switchView(this.layer, fadeTime, fadeTime, () => {}, callback)
    }
    /**
     * Hide created layer
     * @param {Function} callback 
     */
    hide(callback = () => {}) {
        let fadeTime = this.options.fadeTime || 150
        this.layer.style.visibility = 'hidden'
        switchView(this.pView, fadeTime, fadeTime, () => {}, callback)
    }
    /**
     * Destroy created layer
     * @param {Function} callback 
     */
    destroy(callback = () => {}) {
        this.hide(() => {
            this.layer.remove()
            callback()
        })
    }
    /**
     * Append dom content to created layer
     * @param {*} content 
     */
    append(content) {
        this.layer.append(content)
    }
    /**
     * Append HTML (text) content to created layer
     * @param {String} content 
     */
    appendHTML(content) {
        this.layer.innerHTML = (content)
    }
    /**
     * Remove child from created layer
     * @param {*} content 
     */
    removeChild(content) {
        this.layer.removeChild(content)
    }
    /**
     * Get current content(innerHTML) of created layer
     */
    get content() {
        return this.layer
    }
}
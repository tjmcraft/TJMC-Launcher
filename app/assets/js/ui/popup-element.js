export class PopupEl {
    constructor(options = {}) {
        this.options = options
        this.popupLayer = qsl('.layerContainer')
        this.options.parent = this.options.parent || document.body
        this.popup = cE('div', {class: 'tooltip'})
        this.pointerEl = cE('div', {class: 'pointer'})
        this.contentEl = cE('div', {class: 'content'})
        this.popup.id = this.options.id || `popup-${randomString(5)}`
        this.popup.append(this.pointerEl, this.contentEl)
        if (this.popupLayer.qsl(`#${this.popup.id}`)) return
    }

    join(callback = () => {}) {
        this.popup.style.opacity = 0
        this.popup.style.visibility = 'hidden'
        if (this.popupLayer.qsl(`#${this.popup.id}`)) return
        this.popupLayer.append(this.popup)
        callback()
    }

    show(callback = () => { }) {
        //let fadeTime = this.options.fadeTime || 150
        if (!this.popupLayer.qsl(`#${this.popup.id}`)) this.join()
        this.setPopupPos(this.popup, this.options.margin || 10)
        this.popup.style.visibility = 'visible'
        this.popup.style.opacity = 1
        callback()
        //this.popup.fadeIn(fadeTime, callback)
    }

    hide(callback = () => {}) {
        //let fadeTime = this.options.fadeTime || 150
        this.popup.style.opacity = 0
        this.popup.style.visibility = 'hidden'
        callback()
        //this.popup.fadeOut(fadeTime, callback)
    }

    destroy(callback = () => {}) {
        this.hide(() => {
            this.popup.remove()
            callback()
        })
    }

    getPopupPos(el, m = 5) {
        let offset = getPos( this.options.parent ),
            pos = '',
            x_o = ( (this.options.parent.offsetWidth - el.offsetWidth) / 2 ) + offset.left,
            x = (x_o > 0) ? x_o : 0,
            y_t = ( offset.top - m - el.offsetHeight ),
            y_b = ( offset.top + this.options.parent.offsetHeight + m ),
            y = (y_t - 25 > 0) && (pos = 'top') ? y_t : 
                (y_b) && (pos = 'bottom') ? y_b : 0,
            width = (this.options.parent.offsetWidth - m*2)
        return { left: x, top: y, width: width, height: 'auto', position: pos }
    }

    setPopupPos(el, m = 5) {
        let bounds = this.getPopupPos(el, m)
        el.style.position = 'absolute'
        el.style.top = bounds.top + 'px'
        el.style.left = bounds.left + 'px'
        this.popup.setAttribute('position', bounds.position)
        //el.style.width = bounds.width + 'px'
    }

    /**
     * Append dom content to created popup
     * @param {*} content 
     */
    append(content) {
        this.contentEl.append(content)
    }
    /**
     * Append HTML (text) content to created popup
     * @param {String} content 
     */
    appendHTML(content) {
        this.contentEl.innerHTML = (content)
    }
    /**
     * Remove child from created popup
     * @param {*} content 
     */
    removeChild(content) {
        this.contentEl.removeChild(content)
    }

    get content() {
        return this.popup
    }

    update(content) {
        this.contentEl.innerHTML = (content)
        this.show();
    }
}
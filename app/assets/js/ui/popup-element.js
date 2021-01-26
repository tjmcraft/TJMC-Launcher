class PopupEl {
    constructor(options = {}) {
        this.options = options
        this.popupLayer = qsl('.layerContainer')
        this.options.parent = this.options.parent || document.body
        this.popup = createElementWithClass('div', 'tooltip')
        this.pointerEl = createElementWithClass('div', 'pointer')
        this.contentEl = createElementWithClass('div', 'content')
        this.popup.id = this.options.id || `popup-${randomString(5)}`
        this.popup.append(this.pointerEl, this.contentEl)
        if (this.popupLayer.qsl(`#${this.popup.id}`)) return
    }

    join(callback = () => {}) {
        this.popup.style.opacity = 0
        this.popup.style.visibility = 'hidden'
        if (this.popupLayer.qsl(`#${this.popup.id}`)) return
        this.popupLayer.append(this.popup)
        this.setPopupPos(this.popup, this.options.margin || 10)
        callback()
    }

    show(callback = () => {}) {
        let fadeTime = this.options.fadeTime || 150
        if (!this.popupLayer.qsl(`#${this.popup.id}`)) this.join()
        //this.popup.style.visibility = 'visible'
        //this.popup.style.opacity = 1
        //callback()
        this.popup.fadeIn(fadeTime, callback)
    }

    hide(callback = () => {}) {
        let fadeTime = this.options.fadeTime || 150
        //this.popup.style.opacity = 0
        //this.popup.style.visibility = 'hidden'
        this.popup.fadeOut(fadeTime, callback)
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
            y = (y_t > 0) && (pos = 'top') ? y_t : 
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
}

Element.prototype.tooltip = function(text = null) {
    text = text || this.dataset.tooltip || this.title
    if (!text) return
    let parent = this,
    popup = new PopupEl({
        parent: parent,
        margin: 8,
        fadeTime: 50
    })
    popup.appendHTML(text)
    parent.addEventListener('mouseenter', show)
    parent.addEventListener('mouseleave', hide)

    function show() {
        popup.show()
    }
    function hide() {
        popup.destroy()
    }
    function destroy() {
        hide()
        parent.removeEventListener('mouseenter', show)
        parent.removeEventListener('mouseleave', destroy)
    }
}
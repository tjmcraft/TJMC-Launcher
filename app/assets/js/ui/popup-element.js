class PopupEl {
    constructor(options = {}) {
        this.options = options
        this.id = options.id || `popup-${randomString(5)}`
        this.popupLayer = qsl('.layerContainer')
        this.pel = options.parent || document.body
        this.popup = createElementWithClass('div', 'tooltip')
        this.popup.id = this.id
        this.pointerEl = createElementWithClass('div', 'pointer')
        this.contentEl = createElementWithClass('div', 'content')
        this.popup.setAttribute('position', this.options.position || 'bottom')
        this.popup.append(this.pointerEl, this.contentEl)
        if (this.popupLayer.qsl(`#${this.id}`)) return
    }

    join(callback = () => {}) {
        this.popup.style.opacity = 0
        this.popup.style.visibility = 'hidden'
        if (this.popupLayer.qsl(`#${this.id}`)) return
        this.popupLayer.append(this.popup)
        this.setPopupPos(this.popup, this.options.position || 'bottom', this.options.margin || 10)
        callback()
    }

    show(callback = () => {}) {
        let fadeTime = this.options.fadeTime || 150
        if (!this.popupLayer.qsl(`#${this.id}`)) this.join()
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

    getPopupPos(el, pos, m) {
        let offset = getPos( this.pel ),
            //x = ( offset.left + m ) || 0,
            x = ( (this.pel.offsetWidth - el.offsetWidth) / 2 ) + offset.left,
            y = pos == 'top' 
            ? ( offset.top - m - el.offsetHeight) 
            : ( pos == 'bottom' ? ( offset.top + this.pel.offsetHeight + m ) : 0 ),
            width = (this.pel.offsetWidth - m*2)
        return { left: x, top: y, width: width, height: 'auto' }
    }

    setPopupPos( el, pos, m) {
        let bounds = this.getPopupPos( el, pos, m)
        el.style.position = 'absolute'
        el.style.top = bounds.top + 'px'
        el.style.left = bounds.left + 'px'
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

window.popup = function (config) {
    let parent = config.parent,
        text = config.text,
        popup = new PopupEl({
            parent: parent,
            position: 'bottom',
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
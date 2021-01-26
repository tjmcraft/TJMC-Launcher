class PopupEl {
    constructor(options = {}) {
        this.options = options
        this.options.position = this.options.position || 'bottom'
        this.popupLayer = qsl('.layerContainer')
        this.pel = options.parent || document.body
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
        this.setPopupPos(this.popup, this.options.position, this.options.margin || 10)
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

    getPopupPos(el, _pos = null, m = 5) {
        let offset = getPos( this.pel ),
            pos = '',
            x_o = ( (this.pel.offsetWidth - el.offsetWidth) / 2 ) + offset.left,
            x = (x_o > 0) ? x_o : 0,
            y_t = ( offset.top - m - el.offsetHeight ),
            y_b = ( offset.top + this.pel.offsetHeight + m ),
            y = (_pos == 'top' || y_t > 0) && (pos = 'top') ? y_t : 
                (_pos == 'bottom' || y_b) && (pos = 'bottom') ? y_b : 0,
            width = (this.pel.offsetWidth - m*2)
        return { left: x, top: y, width: width, height: 'auto', position: pos }
    }

    setPopupPos(el, pos = null, m = 5) {
        let bounds = this.getPopupPos(el, pos, m)
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

Element.prototype.tooltip = function(text = null) {
    let parent = this,
    popup = new PopupEl({
        parent: parent,
        position: 'bottom',
        margin: 8,
        fadeTime: 50
    })
    text = text || this.dataset.tooltip
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




/*
let tooltipElem;

document.onmouseover = function(event) {
  let target = event.target;
  let position = 'top'

  // если у нас есть подсказка...
  let tooltipHtml = target.dataset.tooltip;
  if (!tooltipHtml) return;

  // ...создадим элемент для подсказки

  tooltipElem = document.createElement('div');
  tooltipElem.className = 'tooltip';
  tooltipElem.innerHTML = tooltipHtml;

  tooltipElem = createElementWithClass('div', 'tooltip')
  let pointerEl = createElementWithClass('div', 'pointer')
  let contentEl = createElementWithClass('div', 'content')
  tooltipElem.id = `popup-${randomString(5)}`
  tooltipElem.style.opacity = 0
  tooltipElem.style.visibility = 'hidden'
  tooltipElem.append(pointerEl, contentEl)
  contentEl.innerHTML = tooltipHtml

  let tooltipContainer = qsl('.layerContainer')
  tooltipContainer.append(tooltipElem);

  // спозиционируем его сверху от аннотируемого элемента (top-center)
  let coords = target.getBoundingClientRect();

  let left = coords.left + (target.offsetWidth - tooltipElem.offsetWidth) / 2;
  if (left < 0) left = 0; // не заезжать за левый край окна

  let top = coords.top - tooltipElem.offsetHeight - 5;
  if (top < 0) { // если подсказка не помещается сверху, то отображать её снизу
    top = coords.top + target.offsetHeight + 5;
    position = 'bottom'
  }

  tooltipElem.setAttribute('position', position)
  tooltipElem.style.left = left + 'px';
  tooltipElem.style.top = top + 'px';
  tooltipElem.style.opacity = 1
  tooltipElem.style.visibility = 'visible'
  //tooltipElem.fadeIn(100)
};

document.onmouseout = function(e) {

  if (tooltipElem) {
    tooltipElem.style.opacity = 0
    tooltipElem.style.visibility = 'hidden'
    tooltipElem.remove();
    tooltipElem = null;
  }

};*/
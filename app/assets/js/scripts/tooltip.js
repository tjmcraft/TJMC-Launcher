import { PopupEl } from '../ui/popup-element.js';
Element.prototype.tooltip = function (text = null) {
    text = text || this.dataset.tooltip || this.title
    if (!text) return
    let parent = this,
        popup = new PopupEl({
            parent: parent,
            margin: 8,
            fadeTime: 100
        })
    popup.appendHTML(text)
    parent.addEventListener('mouseenter', show)
    parent.addEventListener('mouseleave', hide)

    function show(e) {
        popup.show();
    }

    function hide(e) {
        popup.hide(() => popup.destroy());
    }

    function destroy() {
        hide()
        parent.removeEventListener('mouseenter', show)
        parent.removeEventListener('mouseleave', destroy)
    }
}
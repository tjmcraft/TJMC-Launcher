
var vdomOverlay;

export class escBinder {
    constructor (f = null) {
        this.Lonkeyup = f || document.onkeyup
    }
    bind (f) {
        document.onkeyup = (e) => {
            e = e || window.event
            if (((e.key === "Escape" || e.key === "Esc" || e.keyCode === 27) || false) && typeof f === 'function') f.call()
        }
    }
    uibind () {
        document.onkeyup = this.Lonkeyup
    }
}

export class overlayBinder {
    constructor (overlay = null) {
        this.Loverlay = overlay || vdomOverlay || null;
    }
    bind (overlay) {
        //console.log(overlay)
        vdomOverlay = overlay;
        this.Loverlay?.hide();
    }
    uibind () {
        vdomOverlay = this.Loverlay;
        this.Loverlay?.show();
    }
}

class toggleButtonBinder {
    constructor (b = null) {
        this.button = b ?? document.body
    }
    bind (f) {
        this.button.onclick = (e) => {
            if (typeof f === 'function') f(this.button.checked)
        }
    }
    unbind () {
        this.button.onclick = null
    }
}
class LoggerUtil {

    constructor(prefix, style){
        this.prefix = prefix
        this.style = style
        this.disabled = false
    }

    log() {
        if (this.disabled) return;
        console.log.apply(null, [this.prefix, this.style, ...arguments, "\r"])
    }

    info() {
        if (this.disabled) return;
        console.info.apply(null, [this.prefix, this.style, ...arguments, "\r"])
    }

    warn() {
        if (this.disabled) return;
        console.warn.apply(null, [this.prefix, this.style, ...arguments, "\r"])
    }

    debug() {
        if (this.disabled) return;
        console.debug.apply(null, [this.prefix, this.style, ...arguments, "\r"])
    }

    error() {
        if (this.disabled) return;
        console.error.apply(null, [this.prefix, this.style, ...arguments, "\r"])
    }

}

module.exports = function (prefix, style){
    return new LoggerUtil(prefix, style)
}
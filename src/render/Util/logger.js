export default class LoggerUtil {

    constructor(prefix, style) {
        this.prefix = prefix
        this.style = style
    }

    log() {
        console.log.apply(null, [this.prefix, this.style, ...arguments, "\r\n"])
    }

    info() {
        console.info.apply(null, [this.prefix, this.style, ...arguments, "\r\n"])
    }

    warn() {
        console.warn.apply(null, [this.prefix, this.style, ...arguments, "\r\n"])
    }

    debug() {
        console.debug.apply(null, [this.prefix, this.style, ...arguments, "\r\n"])
    }

    error() {
        console.error.apply(null, [this.prefix, this.style, ...arguments, "\r\n"])
    }

}
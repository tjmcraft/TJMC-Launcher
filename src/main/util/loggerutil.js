class LoggerUtil {

    constructor(prefix, style){
        this.prefix = prefix
        this.style = style
    }

    log(){
        console.log.apply(null, [this.prefix, this.style, ...arguments, "\r"])
    }

    info(){
        console.info.apply(null, [this.prefix, this.style, ...arguments, "\r"])
    }

    warn(){
        console.warn.apply(null, [this.prefix, this.style, ...arguments, "\r"])
    }

    debug(){
        console.debug.apply(null, [this.prefix, this.style, ...arguments, "\r"])
    }

    error(){
        console.error.apply(null, [this.prefix, this.style, ...arguments, "\r"])
    }

}

module.exports = function (prefix, style){
    return new LoggerUtil(prefix, style)
}
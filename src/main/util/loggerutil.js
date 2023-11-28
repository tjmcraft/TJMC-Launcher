const log = require('electron-log/main');
const { launcherDir } = require('../Paths');
const path = require('path');
const fs = require('fs');

log.transports.file.level = 'debug';
log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
log.transports.file.resolvePathFn = () => path.join(launcherDir, 'logs/main.log');
log.transports.file.archiveLogFn = function archiveLog(file) {
    file = file.toString();
    const info = path.parse(file);

    try {
        fs.renameSync(file, path.join(info.dir, info.name + '.old' + info.ext));
    } catch (e) {
        console.warn('Could not rotate log', e);
    }
}
log.transports.file.maxSize = 1024;

class LoggerUtil {

    constructor(prefix, style) {
        this.prefix = prefix
        this.style = style
        this.disabled = false
    }

    log() {
        if (this.disabled) return;
        log.log.apply(null, [this.prefix, this.style, ...arguments])
    }

    info() {
        if (this.disabled) return;
        log.info.apply(null, [this.prefix, this.style, ...arguments])
    }

    warn() {
        if (this.disabled) return;
        log.warn.apply(null, [this.prefix, this.style, ...arguments])
    }

    debug() {
        if (this.disabled) return;
        log.debug.apply(null, [this.prefix, this.style, ...arguments])
    }

    error() {
        if (this.disabled) return;
        log.error.apply(null, [this.prefix, this.style, ...arguments])
    }

}

module.exports = function (prefix, style) {
    return new LoggerUtil(prefix, style)
}
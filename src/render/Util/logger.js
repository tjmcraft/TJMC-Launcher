export default class LoggerUtil {

	constructor(prefix, style) {
		this.prefix = prefix;
		this.style = style;
	}

	log(...args) {
		console.log.apply(null, [this.prefix, this.style, ...args, "\r\n"]);
	}

	info(...args) {
		console.info.apply(null, [this.prefix, this.style, ...args, "\r\n"]);
	}

	warn(...args) {
		console.warn.apply(null, [this.prefix, this.style, ...args, "\r\n"]);
	}

	debug(...args) {
		console.debug.apply(null, [this.prefix, this.style, ...args, "\r\n"]);
	}

	error(...args) {
		console.error.apply(null, [this.prefix, this.style, ...args, "\r\n"]);
	}

}
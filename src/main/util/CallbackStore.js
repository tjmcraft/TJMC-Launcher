function CallbackStore() {
	const callbacks = [];

	this.addCallback = (cb = () => void 0) => {
		if (typeof cb === 'function') {
			callbacks.push(cb);
		}
	}

	this.removeCallback = (cb = () => void 0) => {
		const index = callbacks.indexOf(cb);
		if (index != -1) {
			callbacks.splice(index, 1);
		}
	}

	this.runCallbacks = (state) => {
		callbacks.forEach(cb => cb(state));
	}

}

module.exports = CallbackStore;
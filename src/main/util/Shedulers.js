
function debounce(fn,
	ms,
	shouldRunFirst = true,
	shouldRunLast = true,) {
	let waitingTimeout;

	return (...args) => {
		if (waitingTimeout) {
			clearTimeout(waitingTimeout);
			waitingTimeout = undefined;
		} else if (shouldRunFirst) {
			fn(...args);
		}

		// eslint-disable-next-line no-restricted-globals
		waitingTimeout = this.setTimeout(() => {
			if (shouldRunLast) {
				fn(...args);
			}

			waitingTimeout = undefined;
		}, ms);
	};
}

function throttle(fn = () => {},
	ms = 500,
	shouldRunFirst = true,) {
	let interval;
	let isPending;
	let args;

	return (..._args) => {
		isPending = true;
		args = _args;

		if (!interval) {
			if (shouldRunFirst) {
				isPending = false;
				fn(...args);
			}

			// eslint-disable-next-line no-restricted-globals
			interval = this.setInterval(() => {
				if (!isPending) {
					// eslint-disable-next-line no-restricted-globals
					this.clearInterval(interval);
					interval = undefined;
					return;
				}

				isPending = false;
				fn(...args);
			}, ms);
		}
	};
}

exports.debounce = debounce;
exports.throttle = throttle;
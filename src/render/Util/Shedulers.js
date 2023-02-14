
export function debounce(fn,
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
		waitingTimeout = self.setTimeout(() => {
			if (shouldRunLast) {
				fn(...args);
			}

			waitingTimeout = undefined;
		}, ms);
	};
}

export function throttle(fn = () => {},
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
			interval = self.setInterval(() => {
				if (!isPending) {
					// eslint-disable-next-line no-restricted-globals
					self.clearInterval(interval);
					interval = undefined;
					return;
				}

				isPending = false;
				fn(...args);
			}, ms);
		}
	};
}

let beforeUnloadCallbacks;

export function onBeforeUnload(callback, isLast = false) {
	if (!beforeUnloadCallbacks) {
		beforeUnloadCallbacks = [];
		// eslint-disable-next-line no-restricted-globals
		self.addEventListener('beforeunload', () => {
			beforeUnloadCallbacks.length && beforeUnloadCallbacks.forEach((cb) => cb());
		});
	}

	if (isLast) {
		beforeUnloadCallbacks.push(callback);
	} else {
		beforeUnloadCallbacks.unshift(callback);
	}

	return () => {
		beforeUnloadCallbacks.length && (beforeUnloadCallbacks = beforeUnloadCallbacks.filter((cb) => cb !== callback));
	};
}

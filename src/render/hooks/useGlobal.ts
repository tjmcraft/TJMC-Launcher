import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { shallowEqual, stacksDiff, stacksEqual } from "Util/Iterates";
import { GlobalState, MapStateToProps, addCallback, getState, removeCallback } from "Store/Global";
import { randomString } from "Util/Random";
import useForceUpdate from "./useForceUpdate";

const updateContainer = <T extends MapStateToProps<T>>(selector: T, callback: Function, options: PickOptions) => {
	return (global: GlobalState): ReturnType<T> =>
		callback((prevState) => {

			let nextState;
			try {
				nextState = selector(global);
			} catch (err) {
				return;
			}

			if (nextState != void 0) {

				const isArray = Array.isArray(prevState) || Array.isArray(nextState);
				const shouldUpdate = isArray ?
					!stacksEqual(prevState, nextState) :
					!shallowEqual(prevState, nextState);

				if (options.debugPicker) {
					console.debug(
						"[picker]", "->", options.label,
						"\n", "state", "=>", "picking",
						"\n", "next", "=>", nextState,
						...(isArray ? (
							[
								"\n", "stacksEqual", "=>", stacksEqual(prevState, nextState),
								"\n", "stacksDiff", "=>", stacksDiff(prevState, nextState),
								"\n", "current", "=>", prevState,
								"\n", "next", "=>", nextState,
								"\n", "result", "=>", shouldUpdate,
							]
						) : [])
					);
				}

				if (
					// !arePropsShallowEqual(prevState, nextState)
					shouldUpdate
				) {
					if (options.debugPicked) {
						console.debug(
							"[picker]", "->", options.label,
							"\n", "state", "=>", "picked!",
							"\n", "next", "=>", nextState,
						);
					}
					return nextState;
				}
			}
			return prevState;
		});
};

type PickOptions = {
	debugPicker?: boolean;
	debugPicked?: boolean;
	label?: string;
}

const useGlobal = <T extends MapStateToProps<T>>(
	selector: T,
	inputs: React.DependencyList = [],
	options: PickOptions = {}
): ReturnType<T> => {

	options = useMemo(() => Object.assign({ debugPicker: false, debugPicked: false, label: randomString(5) }, options), [options]);

	const forceUpdate = useForceUpdate();
	const mappedProps = useRef<ReturnType<typeof selector>>(undefined);

	const picker = useCallback(selector, [selector, ...inputs]);

	useMemo(() => {
		let nextState;
		try {
			nextState = getState(picker);
		} catch (e) {
			return undefined;
		}
		mappedProps.current = nextState;
	}, [picker]);

	useEffect(() => {
		const updateCallback = (next) => {
			let nextState;
			try {
				if (typeof next == 'function') {
					nextState = next(mappedProps.current);
				} else {
					nextState = next;
				}
			} catch (e) {
				return undefined;
			}
			if (nextState != null && nextState != mappedProps.current) {
				mappedProps.current = nextState;
				void forceUpdate(bool => !bool);
			}
		};
		const callback = updateContainer(picker, updateCallback, options);
		addCallback(callback);
		return () => removeCallback(callback);
	}, [forceUpdate, picker, options]);

	return mappedProps.current;
};

export default useGlobal;
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { shallowEqual, stacksDiff, stacksEqual } from "Util/Iterates";
import { addCallback, getState, removeCallback } from "Store/Global";
import { randomString } from "Util/Random";
import useEffectAfterMount from "./useEffectAfterMount";

const updateContainer = (selector, callback, options) => {
	return (global) => {
		callback((prev) => {
			if (options.debugPicker) {
				console.debug("[picker]", options.label, "\nprev->\n", JSON.stringify(prev));
				// window._dp = { [options.label]: propsRef };
			}
			let nextState;
			try {
				nextState = selector(global);
				if (Array.isArray(nextState)) nextState = { internalArray: [...nextState] };
			} catch (err) {
				return;
			}
			if (nextState != undefined) {
				if (options.debugPicker) {
					console.debug("[picker]", options.label, "\nnext->\n", JSON.stringify(nextState));
				}
				const stage1 = prev != void 0;
				const stage2 = stage1 && prev.internalArray != void 0 &&
					nextState.internalArray != void 0;

				const shouldRepick2 = (
					prev?.internalArray != void 0 &&
					nextState.internalArray != void 0 &&
					!stacksEqual(prev?.internalArray, nextState?.internalArray)
				) || !shallowEqual(prev, nextState);

				const shouldRepick = stage2 ?
					!stacksEqual(prev.internalArray, nextState.internalArray) :
					!shallowEqual(prev, nextState);

				if (
					shouldRepick
				) {
					if (options.debugPicked) {
						console.debug(
							"[picker]", "->", options.label,
							"\n", "state", "=>", "picked!",
							"\n", "next", "=>", nextState,
							...(nextState.internalArray ? (
								[
									"\n", "stacksEqual", "=>", stacksEqual(prev.internalArray, nextState.internalArray),
									"\n", "stacksDiff", "=>", stacksDiff(prev.internalArray, nextState.internalArray),
									"\n", "current", "=>", prev.internalArray,
									"\n", "next", "=>", nextState.internalArray,
									"\n", "stages", "=>", [stage1, stage2],

								]
							) : [undefined])
						);
					}
					console.warn(">>", "propsRefSet", nextState);
					return nextState;
				}
			}
			return prev;
		});
	};
};

/**
 * useGlobal hook
 * @param {*} selector selector function (picker)
 * @param {React.DependencyList} inputs dependency list
 * @param {Object} options options (for debug)
 * @param {boolean} [options.debugPicker] debug picker function
 * @param {boolean} [options.debugPicked] debug when picker picked
 * @param {string} [options.label] picker label for debug
 * @returns
 */
const useGlobal = (selector = () => { }, inputs = [], options = undefined) => {

	options = useMemo(() => Object.assign({ debugPicker: false, debugPicked: false, label: randomString(5) }, options), [options]);

	const picker = useCallback(selector, [selector, ...inputs]);
	const initialState = useCallback(() => {
		let nextState;
		options.debugPicker && console.log(">>", "init picker", "->", options.label);
		try {
			nextState = getState(picker);
			if (Array.isArray(nextState)) nextState = { internalArray: [...nextState] };
			return nextState;
		} catch (e) {
			return undefined;
		}
	}, [picker, options]);

	const [state, setState] = useState(initialState);
	useEffectAfterMount(() => setState(initialState), [initialState]);

	useEffect(() => {
		const callback = updateContainer(picker, setState, options);
		addCallback(callback);
		options.debugPicker && console.log(">>", "load picker", "->", options.label);
		return () => {
			removeCallback(callback);
			options.debugPicker && console.log(">>", "unload picker", "->", options.label);
		};
	}, [picker, options]);

	return state?.internalArray || state;
};

export default useGlobal;
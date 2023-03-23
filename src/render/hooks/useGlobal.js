import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { arePropsShallowEqual, shallowEqual, stacksDiff, stacksEqual } from "Util/Iterates";
import { addCallback, getState, removeCallback } from "Store/Global";
import { randomString } from "Util/Random";
import useEffectAfterMount from "./useEffectAfterMount";

const updateContainer = (selector, callback, options) => {
	return (global) => {
		callback((prev) => {
			if (options.debugPicker) {
				console.debug("[picker]", options.label, "\nprev->\n", JSON.stringify(prev));
			}
			let nextState;
			try {
				nextState = selector(global);
			} catch (err) {
				return;
			}
			if (nextState != undefined) {
				if (options.debugPicker) {
					console.debug("[picker]", options.label, "\nnext->\n", JSON.stringify(nextState));
				}

				const stage1 = prev != void 0;
				const stage2 = stage1 && Array.isArray(prev) &&
					nextState != void 0;

				const shouldRepick = stage2 ?
					!stacksEqual(prev, nextState) :
					!shallowEqual(prev, nextState);

				if (options.debugPicker) {
					console.debug(
						"[picker]", "->", options.label,
						"\n", "state", "=>", "picking",
						"\n", "next", "=>", nextState,
						...(Array.isArray(prev) ? (
							[
								"\n", "stacksEqual", "=>", stacksEqual(prev, nextState),
								"\n", "stacksDiff", "=>", stacksDiff(prev, nextState),
								"\n", "current", "=>", prev,
								"\n", "next", "=>", nextState,
								"\n", "stages", "=>", [stage1, stage2],
								"\n", "result", "=>", shouldRepick,

							]
						) : [])
					);
				}

				if (
					// !arePropsShallowEqual(prev, nextState)
					shouldRepick
				) {
					if (options.debugPicked) {
						console.debug(
							"[picker]", "->", options.label,
							"\n", "state", "=>", "picked!",
							"\n", "next", "=>", nextState,
							...(Array.isArray(prev) ? (
								[
									"\n", "stacksEqual", "=>", stacksEqual(prev, nextState),
									"\n", "stacksDiff", "=>", stacksDiff(prev, nextState),
									"\n", "current", "=>", prev,
									"\n", "next", "=>", nextState,
									"\n", "stages", "=>", [stage1, stage2],

								]
							) : [])
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

	return state;
};

export default useGlobal;
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { shallowEqual, stacksDiff, stacksEqual } from "Util/Iterates";
import { addCallback, getState, removeCallback } from "Store/Global";
import useForceUpdate from "./useForceUpdate";
import { generateIdFor, randomString } from "Util/Random";

const updateContainer = (propsRef, selector, callback, options) => {
	return (global) => {
		if (options.debugPicker) {
			console.debug("[picker]", options.label, "\nprev->\n", JSON.stringify(propsRef.current));
			// window._dp = { [options.label]: propsRef };
		}
		let nextState;
		try {
			nextState = selector(global);
			if (Array.isArray(nextState)) nextState = { internalArray: Array().concat(nextState) };
		} catch (err) {
			return;
		}
		if (nextState != undefined) {
			if (options.debugPicker) {
				console.debug("[picker]", options.label, "\nnext->\n", JSON.stringify(nextState));
			}
			const stage1 = propsRef.current != void 0;
			const stage2 = stage1 && propsRef.current.internalArray != void 0 &&
				nextState.internalArray != void 0;

			const shouldRepick2 = (
				propsRef.current?.internalArray != void 0 &&
				nextState.internalArray != void 0 &&
				!stacksEqual(propsRef.current?.internalArray, nextState?.internalArray)
			) || !shallowEqual(propsRef.current, nextState);

			const shouldRepick = stage2 ?
				!stacksEqual(propsRef.current.internalArray, nextState.internalArray) :
				!shallowEqual(propsRef.current, nextState);

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
								"\n", "stacksEqual", "=>", stacksEqual(propsRef.current.internalArray, nextState.internalArray),
								"\n", "stacksDiff", "=>", stacksDiff(propsRef.current.internalArray, nextState.internalArray),
								"\n", "current", "=>", propsRef.current.internalArray,
								"\n", "next", "=>", nextState.internalArray,
								"\n", "stages", "=>", [stage1, stage2],

							]
						) : [undefined])
					);
				}
				console.warn(">>", "propsRefSet", nextState);
				propsRef.current = { ...nextState };
				callback(nextState.internalArray ?? nextState);
			}
		}
	};
};

const containers = new Map();

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

	const forceUpdate = useForceUpdate();
	const mappedProps = useRef(undefined);

	const picker = useCallback(selector, [selector, ...inputs]);

	useMemo(() => {
		let nextState;
		options.debugPicker && console.log(">>", "init picker", "->", options.label);
		try {
			nextState = getState(picker);
			if (Array.isArray(nextState)) nextState = { internalArray: nextState };
			mappedProps.current = nextState;
		} catch (e) {
			return undefined;
		}
	}, [picker, options]);

	useEffect(() => {
		const updateCallback = () => forceUpdate(bool => !bool);
		const callback = updateContainer(mappedProps, picker, updateCallback, options);
		addCallback(callback);
		options.debugPicker && console.log(">>", "load picker", "->", options.label);
		return () => {
			removeCallback(callback);
			options.debugPicker && console.log(">>", "unload picker", "->", options.label);
		}
	}, [forceUpdate, picker, options]);

	return mappedProps.current?.internalArray || mappedProps.current;
};

export default useGlobal;
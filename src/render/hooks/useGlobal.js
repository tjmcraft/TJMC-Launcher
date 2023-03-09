import { useCallback, useEffect, useMemo, useRef } from "react";
import { shallowEqual, stacksEqual } from "Util/Iterates";
import { addCallback, getState, removeCallback } from "Util/Store";
import useForceUpdate from "./useForceUpdate";

const updateContainer = (propsRef, selector, callback) => {
	return (global) => {
		let nextState;
		try {
			nextState = selector(global);
			if (Array.isArray(nextState)) nextState = { internalArray: nextState };
		} catch (err) {
			return;
		}
		if (nextState != undefined) {
			// console.debug("[picker]", "->", selector, "\n=>", propsRef.current, "->", nextState);
			if (
				(
					propsRef.current.internalArray != void 0 &&
					nextState.internalArray != void 0 &&
					!stacksEqual(propsRef.current.internalArray, nextState.internalArray)
				) || !shallowEqual(propsRef.current, nextState)
			) {
				// console.debug("[picker]", "->", selector, "\n=>", "picked!", "\n=>", nextState);
				propsRef.current = nextState;
				callback(nextState);
			}
		}
	};
};

const useGlobal = (selector = () => { }, inputs = []) => {

	const forceUpdate = useForceUpdate();
	const mappedProps = useRef(undefined);

	const picker = useCallback(selector, [selector, ...inputs]);

	useMemo(() => {
		let nextState;
		try {
			nextState = getState(picker);
			if (Array.isArray(nextState)) nextState = { internalArray: nextState };
			mappedProps.current = nextState;
		} catch (e) {
			return undefined;
		}
	}, [picker]);

	useEffect(() => {
		const callback = updateContainer(mappedProps, picker, forceUpdate);
		addCallback(callback);
		return () => removeCallback(callback);
	}, [forceUpdate, picker]);

	return mappedProps.current.internalArray || mappedProps.current;
};

export default useGlobal;
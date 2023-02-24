import { useCallback, useEffect, useMemo, useRef } from "react";
import { shallowEqual } from "Util/Iterates";
import { addCallback, getState, removeCallback } from "Util/Store";
import useForceUpdate from "./useForceUpdate";

const updateContainer = (propsRef, selector, callback) => {
	return (global) => {
		let nextState;
		try {
			nextState = selector(global);
		} catch (err) {
			return;
		}
		// console.debug("[picker]", "->", selector, "\n=>", propsRef.current, "->", nextState);
		if (nextState != undefined && !shallowEqual(propsRef.current, nextState)) {
			// console.debug("[picker]", "->", selector, "\n=>", "picked!");
			propsRef.current = nextState;
			callback(nextState);
		}
	};
};

const useGlobal = (selector = () => { }, inputs = []) => {

	const forceUpdate = useForceUpdate();
	const mappedProps = useRef(undefined);

	const picker = useCallback(selector, [selector, ...inputs]);

	useMemo(() => {
		try {
			mappedProps.current = getState(picker);
		} catch (e) {
			return undefined;
		}
	}, [picker]);

	useEffect(() => {
		const callback = updateContainer(mappedProps, picker, forceUpdate);
		addCallback(callback);
		return () => removeCallback(callback);
	}, [forceUpdate, picker]);

	return mappedProps.current;
};

export default useGlobal;
import { useCallback, useEffect, useMemo, useRef } from "react";
import { shallowEqual } from "Util/Iterates";
import { addCallback, getState, removeCallback } from "Store/Progress";
import useForceUpdate from "./useForceUpdate";

const updateContainer = (propsRef, selector, callback) => {
	return (global) => {
		let nextState;
		try {
			nextState = selector(global);
		} catch (err) {
			return;
		}
		if (nextState != undefined) {
			if (
				!shallowEqual(propsRef.current, nextState)
			) {
				propsRef.current = nextState;
				callback(nextState);
			}
		}
	};
};

const useGlobalProgress = <T extends () => ReturnType<T>>(
	selector: T,
	inputs = []
): ReturnType<T> => {

	const forceUpdate = useForceUpdate();
	const mappedProps = useRef(undefined);

	const picker = useCallback(selector, [selector, ...inputs]);

	useMemo(() => {
		let nextState;
		try {
			nextState = getState(picker);
			mappedProps.current = nextState;
		} catch (e) {
			return undefined;
		}
	}, [picker]);

	useEffect(() => {
		const updateCallback = () => forceUpdate(bool => !bool);
		const callback = updateContainer(mappedProps, picker, updateCallback);
		addCallback(callback);
		return () => removeCallback(callback);
	}, [forceUpdate, picker]);

	return mappedProps.current;
};

export default useGlobalProgress;
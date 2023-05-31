import { useCallback, useState } from "react";

/**
 * Use Flag state toggle
 * @param {boolean} initial
 * @returns {[Boolean,Function,Function]}
 */
const useFlag = (initial = false) => {
	const [value, setValue] = useState(initial);

	const setTrue = useCallback(() => {
		setValue(true);
	}, []);

	const setFalse = useCallback(() => {
		setValue(false);
	}, []);

	return [value, setTrue, setFalse];
};

export default useFlag;
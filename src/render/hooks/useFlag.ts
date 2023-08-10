import { useCallback, useState } from "react";

const useFlag = (initial = false): [boolean, AnyFunction, AnyFunction] => {
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
import { useMemo } from "react";

const useConstructor = (callBack = () => { }) => {
	return useMemo(() => callBack(), [callBack]);
};

export default useConstructor;
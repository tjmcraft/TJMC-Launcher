import { useReducer, useState } from "react";

const useForceUpdate = () => {
	// return useReducer(bool => !bool, false)[1];
	return useState(bool => !bool)[1];
};

export default useForceUpdate;
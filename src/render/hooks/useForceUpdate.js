import { useState } from "react";

const useForceUpdate = () => {
	// return useReducer(bool => !bool, false)[1];
	return useState(false)[1];
};

export default useForceUpdate;
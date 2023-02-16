import { createElement } from "react";

import useGlobal from "Hooks/useGlobal";


const Route = ({path, children}) => {
	let currentScreen = useGlobal(global => global.currentMainScreen);
	if (currentScreen == "*") currentScreen = path;
	return currentScreen == path ? children : null;
};

export default Route;

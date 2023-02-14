import useGlobal from "Hooks/useGlobal";
import { createElement } from "react";

const Route = ({path, children}) => {
	let currentScreen = useGlobal(global => global.currentMainScreen);
	if (currentScreen == "*") currentScreen = path;
	return currentScreen == path ? children : null;
};

export default Route;

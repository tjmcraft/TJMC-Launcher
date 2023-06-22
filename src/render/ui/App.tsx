import { memo, createElement } from "react";

import { getDispatch } from "Store/Global";
import useGlobal from "Hooks/useGlobal";
import useConstructor from "Hooks/useConstructor.js";

import Preloader from "UI/components/Preloader";
import Auth from "UI/Auth/Auth.js";
import AppContainer from "UI/AppContainer";

const App = () => {

	const { initHost, initApi } = getDispatch();
	useConstructor(initHost);
	useConstructor(initApi);

	const isAuthReady = useGlobal(global => ["ready"].includes(global.auth_state));

	return (
		<div className="app">
			<Preloader />
			<Auth isShown={!isAuthReady} />
			<AppContainer isShown={isAuthReady} />
		</div>
	);
};

export default memo(App);

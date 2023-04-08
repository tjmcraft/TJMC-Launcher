import { memo, createElement, useEffect } from "react";

import { getDispatch } from "Store/Global.js";
import useGlobal from "Hooks/useGlobal.js";
import useConstructor from "Hooks/useConstructor.js";

import Preloader from "UI/Preloader.js";
import Auth from "UI/Auth/Auth.js";
import AppContainer from "./AppContainer";

const App = () => {

	const { initHost } = getDispatch();
	useConstructor(initHost);

	const isAuthReady = useGlobal(global => ["ready"].includes(global.auth_state));

	return (
		<div className="app">
			<Preloader />
			<Auth isShown={!isAuthReady} />
			<AppContainer isShown={isAuthReady} />
		</div>
	);
};

export default (App);

import { memo, createElement, useEffect } from "react";

import { getDispatch } from "Util/Store.js";
import useGlobal from "Hooks/useGlobal.js";
import useConstructor from "Hooks/useConstructor.js";

import Preloader from "./Preloader.js";
import Auth from "./Auth/Auth.js";
import Main from "./Main.js";

const AppContainer = memo(() => {

	const { initHost, openSettingsModal } = getDispatch();
	useConstructor(() => initHost());

	useEffect(() => {
		// @ts-ignore
		electron.on('open-settings', (e, data) => openSettingsModal()); // Send global event to open settings [electron]
	}, [openSettingsModal]);

	return (
		<div className="app-container">
			<Main />
			<div className="uploadArea" />
		</div>
	);
});

const App = () => {

	const { initApi } = getDispatch();
	useConstructor(() => initApi());

	const isAuthReady = useGlobal(global => global.auth_state) == "ready";

	return (
		<div className="app">
			{isAuthReady ? <AppContainer /> : <Auth />}
			<Preloader />
		</div>
	);
};

export default memo(App);
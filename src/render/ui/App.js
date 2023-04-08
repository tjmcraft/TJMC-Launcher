import { memo, createElement, useEffect } from "react";

import { getDispatch } from "Store/Global.js";
import useGlobal from "Hooks/useGlobal.js";
import useConstructor from "Hooks/useConstructor.js";

import Preloader from "UI/Preloader.js";
import Auth from "UI/Auth/Auth.js";
import Main from "UI/Main.js";
import useShowTransition from "Hooks/useShowTransition";
import buildClassName from "Util/buildClassName";

const AppContainer = ({ isShown }) => {

	const { openSettingsModal } = getDispatch();

	useEffect(() => {
		// @ts-ignore
		electron.on('open-settings', (e, data) => openSettingsModal()); // Send global event to open settings [electron]
	}, [openSettingsModal]);

	const {
		shouldRender,
		transitionClassNames,
	} = useShowTransition(
		isShown, undefined, true, undefined, false, { }, 1350
		);

	return shouldRender && (
		<div className={buildClassName("app-container",transitionClassNames)}>
			<Main />
			<div className="uploadArea" />
		</div>
	);
};

const App = () => {

	const { initHost } = getDispatch();
	useConstructor(initHost);

	const isAuthReady = useGlobal(global => ["ready"].includes(global.auth_state));

	return (
		<div className="app">
			<Auth isShown={!isAuthReady} />
			<AppContainer isShown={isAuthReady} />
			<Preloader />
		</div>
	);
};

export default (App);

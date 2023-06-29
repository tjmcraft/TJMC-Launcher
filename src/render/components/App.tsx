import { memo, createElement, Fragment } from "react";

import { getDispatch } from "Store/Global";
import useGlobal from "Hooks/useGlobal";
import useConstructor from "Hooks/useConstructor";

import Frame from "Components/Frame";
import LayerContainer from "Components/LayerContainer";
import Preloader from "Components/Preloader";
import Auth from "Components/Auth/Auth";
import Main from "Components/Main/Main";

const App = () => {

	const { initHost, initApi } = getDispatch();
	useConstructor(initHost);
	useConstructor(initApi);

	const isAuthReady = useGlobal(global => ["ready"].includes(global.auth_state));

	return (
		<Fragment>
			<Frame />
			<div className="app">
				<Preloader />
				<Auth isShown={!isAuthReady} />
				<Main isShown={isAuthReady} />
			</div>
			<LayerContainer />
		</Fragment>
	);
};

export default memo(App);

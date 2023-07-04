import { memo, createElement, Fragment } from "react";

import { getDispatch } from "Store/Global";
import useGlobal from "Hooks/useGlobal";
import useConstructor from "Hooks/useConstructor";

import Frame from "Components/Frame";
import LayerContainer from "Components/LayerContainer";
import Preloader from "Components/Preloader";
import Auth from "Components/Auth/Auth";
import Main from "Components/Main/Main";
import Transition from "UI/Transition";

const App = () => {

	const { initHost, initApi } = getDispatch();
	useConstructor(initHost);
	useConstructor(initApi);

	const AuthState = useGlobal(global => global.auth_state);

	function renderContent() {
		switch (AuthState) {
			case "ready":
				return <Main />;
			default:
				return <Auth />
		}
	};

	function getActiveKey() {
		switch (AuthState) {
			case "ready":
				return 1;
			default:
				return 0;
		}
	}

	return (
		<Fragment>
			<Frame />
			<div className="app">
				<Preloader />
				<Transition
					activeKey={getActiveKey()}
				>
					{renderContent}
				</Transition>
			</div>
			<LayerContainer />
		</Fragment>
	);
};

export default memo(App);

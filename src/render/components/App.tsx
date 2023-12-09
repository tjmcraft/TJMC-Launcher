import { memo, createElement, Fragment, useEffect } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Store/Global";
import useGlobal from "Hooks/useGlobal";

import Frame from "Components/Frame";
import LayerContainer from "Components/LayerContainer";
import Preloader from "Components/Preloader";
import Auth from "Components/Auth/Auth";
import Main from "Components/Main/Main";
import Transition from "UI/Transition";

const App = () => {

	const { initHost, initApi } = getDispatch();
	useEffect(initHost, [initHost]);
	useEffect(initApi, [initApi]);

	const AuthState = useGlobal(global => global.auth_state);
	const isModalsOpen = useGlobal(global => global.modals.length > 0);

	function renderContent(a,b,c) {
		switch (AuthState) {
			case "ready":
				return <Main isActive={!isModalsOpen && c == 1} />;
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
			<div className={buildClassName('app', isModalsOpen && 'blurred')}>
				<Preloader />
				<Transition
					activeKey={getActiveKey()}
					name="push"
				>
					{renderContent}
				</Transition>
			</div>
			<LayerContainer isActive={isModalsOpen} />
		</Fragment>
	);
};

export default memo(App);

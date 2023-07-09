import { createElement, memo, useCallback, useEffect } from "react";

import useGlobal from "Hooks/useGlobal";
import buildClassName from "Util/buildClassName";

import CubeContent from "./CubeContainer/CubeContent";
import MapContainer from "./MapContainer";
import Transition from "UI/Transition";
import Settings from "./Settings";
import { UserPanelMain } from "./UserPanel";
import { InstallationsScroller, InstanceScroller } from "./CubeContainer/CubeSidebar";
import { addReducer, removeReducer } from "Store/Global";


const Main = () => {

	const currentMainScreen = useGlobal(global => global.currentMainScreen);

	const runShortcutAction = useCallback((actions, { type, data }) => {
		const createInstallation = () => actions.openVersionChooserModal();
		const hostActions = {
			createInstallation
		};
		if (hostActions.hasOwnProperty(type))
			(hostActions[type])(data);
	}, []);

	useEffect(() => {
		const handler = (global, actions, payload) => runShortcutAction(actions, payload);
		addReducer('runShortcutAction', handler);
		return () => removeReducer('runShortcutAction', handler);
	}, [runShortcutAction]);

	return (
		<div className={buildClassName("container", "main")}>
			<nav className={buildClassName("leftColumn", "sidebar")}>
				<UserPanelMain />
				<InstallationsScroller />
				<InstanceScroller />
			</nav>
			<div className={buildClassName("middleColumn", "content")}>
				{currentMainScreen.type == 'installation' && (
					<CubeContent hash={currentMainScreen.hash} />
				)}
				{currentMainScreen.type == 'map' && (
					<MapContainer />
				)}
			</div>
		</div>
	);
};

const MainContainer = () => {

	const isSettingsOpen = useGlobal(global => global.isSettingsOpen);

	const runShortcutAction = useCallback((actions, { type, data }) => {
		const openSettings = () => actions.openSettings();
		const openShortcuts = () => actions.openShortcutsModal();
		const hostActions = {
			openSettings,
			openShortcuts,
		};
		if (hostActions.hasOwnProperty(type))
			(hostActions[type])(data);
	}, []);

	useEffect(() => {
		const handler = (global, actions, payload) => runShortcutAction(actions, payload);
		addReducer('runShortcutAction', handler);
		return () => removeReducer('runShortcutAction', handler);
	}, [runShortcutAction]);

	function renderContent() {
		if (isSettingsOpen) {
			return <Settings />;
		}
		return <Main />;
	}

	function getActiveKey() {
		if (isSettingsOpen) return 1;
		return 0;
	}

	return (
		<div className="app-container">
			<Transition
				activeKey={getActiveKey()}
			>
				{renderContent}
			</Transition>
			<div className="uploadArea" />
		</div>
	);
};

export default memo(MainContainer);
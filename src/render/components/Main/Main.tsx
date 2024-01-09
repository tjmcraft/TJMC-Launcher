import React, { Fragment, createElement, memo, useCallback, useEffect, useRef } from "react";

import { addReducer, getDispatch, removeReducer } from "Store/Global";
import useGlobal from "Hooks/useGlobal";
import buildClassName from "Util/buildClassName";

import Transition from "UI/Transition";
import CubeContent from "./CubeContainer/CubeContent";
import MapContainer from "./MapContainer";
import Settings from "./Settings";
import { InstallationsScroller, InstanceScroller } from "./CubeContainer/CubeSidebar";
import UserPanel from "./UserPanel";
import Tooltip from "UI/Tooltip";

const UserPanelMain = () => {
	const { selectMainScreen, openSettings } = getDispatch();
	const currentMainScreen = useGlobal(global => global.currentMainScreen);

	const mapButton = useRef();
	const settingsButton = useRef();

	const onMapClick = () => selectMainScreen({ type: 'map' });
	const onSettingsClick = () => openSettings();

	return (
		<UserPanel>
			<button ref={mapButton}
				id="map-button"
				className={buildClassName("circle", currentMainScreen.type == 'map' && "filled")}
				onClick={onMapClick}
				role="button" tabIndex={1}
			>
				<i className="icon-location" />
			</button>
			<Tooltip forRef={mapButton}>Карта</Tooltip>
			<button ref={settingsButton}
				id="settings-button"
				className="circle"
				onClick={onSettingsClick}
				role="button" tabIndex={2}
			>
				<i className="icon-settings" />
			</button>
			<Tooltip forRef={settingsButton}>Настройки</Tooltip>
		</UserPanel>
	);
};

const Main = ({ isActive }: { isActive: boolean }) => {

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
		<div className={buildClassName("container", "main", isActive && "active")}>
			<nav className={buildClassName("leftColumn", "sidebar")}>
				<UserPanelMain />
				<InstallationsScroller isActive={isActive} />
				<InstanceScroller />
			</nav>
			<div className={buildClassName("middleColumn", "content")}>
				{currentMainScreen.type == 'installation' && (
					<Fragment>
						<CubeContent hash={currentMainScreen.hash} />
					</Fragment>
				)}
				{currentMainScreen.type == 'map' && (
					<div className="r-box">
						<MapContainer />
					</div>
				)}
			</div>
		</div>
	);
};

const MainContainer = ({ isActive }: { isActive: boolean }) => {

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

	function renderContent(a, b, c) {
		if (isSettingsOpen) return <Settings isActive={isActive && c == 1} />;
		return <Main isActive={isActive && c == 0} />;
	}

	function getActiveKey() {
		if (isSettingsOpen) return 1;
		return 0;
	}

	return (
		<div className="app-container">
			<Transition
				activeKey={getActiveKey()}
				name="push"
			>
				{renderContent}
			</Transition>
			<div className="uploadArea" />
		</div>
	);
};

export default memo(MainContainer);
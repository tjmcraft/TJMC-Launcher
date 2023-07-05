import { createElement, memo } from "react";

import useGlobal from "Hooks/useGlobal";
import { getDispatch } from "Store/Global";
import buildClassName from "Util/buildClassName";

import CubeContent from "./CubeContainer/CubeContent";
import MapContainer from "./MapContainer";
import Transition from "UI/Transition";
import Settings from "./Settings";
import UserPanel from "./UserPanel";
import { InstallationsScroller, InstanceScroller } from "./CubeContainer/CubeSidebar";


const Main = () => {
	const { selectMainScreen } = getDispatch();
	const currentMainScreen = useGlobal(global => global.currentMainScreen);

	return (
		<div className={buildClassName("container", "main")}>
			<nav className={buildClassName("leftColumn", "sidebar")}>
				<div className=""><UserPanel /></div>
				<div className="">
					<div className={buildClassName("discover", "no-scrollbar")}>
						<div className={buildClassName('categoryItem', currentMainScreen.type == 'map' && "selected")}>
							<div className="innerItem" onClick={() => selectMainScreen({ type: 'map' })}>
								<i className="icon-location"></i>
								<div className="content">{"Map"}</div>
							</div>
						</div>
					</div>
				</div>
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
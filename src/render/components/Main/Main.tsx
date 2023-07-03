import { createElement, memo } from "react";

import useGlobal from "Hooks/useGlobal";
import { getDispatch } from "Store/Global";
import buildClassName from "Util/buildClassName";

import { SVG } from "UI/svg";
import Transition from "UI/Transition";
import CubeSidebar from "./CubeContainer/CubeSidebar";
import CubeContent from "./CubeContainer/CubeContent";
import UserIcon from "./UserIcon";
import MapContainer from "./MapContainer";


const Main = () => {
	const { openSettingsModal, selectMainScreen } = getDispatch();
	const currentMainScreen = useGlobal(global => global.currentMainScreen);

	return (
		<div className="container">
			<div className={buildClassName("leftColumn", "sidebar")}>
				<div className={buildClassName("discover", "no-scrollbar")}>
					<div className="headerDiscover">
						<h2 className="size24">{"Главная"}</h2>
						<div className="container">
							<UserIcon onClick={() => openSettingsModal({ tab: 'my-account' })} />
						</div>
					</div>
					<div className={buildClassName('categoryItem', currentMainScreen.type == 'map' && "selected")}>
						<div className="innerItem" onClick={() => selectMainScreen({ type: 'map' })}>
							<div className="avatar">{SVG('map')}</div>
							<div className="content">{"Map"}</div>
						</div>
					</div>
				</div>
				<div className="separator" />
				<CubeSidebar />
			</div>
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

const MainContainer = ({ isShown }) => {
	return (
		<Transition className={"app-container"} isShown={isShown}>
			<Main />
			<div className="uploadArea" />
		</Transition>
	);
};

export default memo(MainContainer);
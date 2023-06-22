import { createElement, memo } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Store/Global";
import useGlobal from "Hooks/useGlobal";

import Transition from "UI/Transition";
import Route from "UI/components/Route";
import { Guild } from "Components/Guild";
import { SVG } from "UI/svg";
import CubeContainer from "Components/Main/CubeContainer";


const Main = () => {

	const { selectMainScreen, openMapModal } = getDispatch();
	const currentScreen = useGlobal(global => global.currentMainScreen);

	return (
		<div className="container">
			<div className="guilds">
				<div className={buildClassName("scroller", "no-scrollbar")}>
					<Guild type="item" svg={SVG('home')} onClick={() => selectMainScreen('cube')} selected={currentScreen == 'cube'} />
					<Guild type="separator" />
					<Guild type="item" svg={SVG('map')} onClick={() => openMapModal()} />
				</div>
			</div>
			<Route path="cube"><CubeContainer /></Route>
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
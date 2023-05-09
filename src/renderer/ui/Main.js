import { createElement, useEffect, useState, memo } from "react";

import { getDispatch } from "Store/Global";
import useGlobal from "Hooks/useGlobal";
import { SVG } from "./svg";

import Route from "UI/components/Route";
import CubeContainer from "UI/CubeContainer";
import { Guild } from "UI/guilds";
import MapContainer from "./MapContainer";
import buildClassName from "Util/buildClassName";


const Main = () => {

	const { selectMainScreen } = getDispatch();
	const currentScreen = useGlobal(global => global.currentMainScreen);

	return (
		<div className="container">
			<div className="guilds">
				<div className={buildClassName("scroller", "no-scrollbar")}>
					<Guild type="item" svg={SVG('cube')} onClick={() => selectMainScreen('cube')} selected={currentScreen == 'cube'} />
					<Guild type="separator" />
					<Guild type="item" svg={SVG('map')} onClick={() => selectMainScreen('map')} selected={currentScreen == 'map'} />
				</div>
			</div>
			<Route path="map"><MapContainer /></Route>
			<Route path="cube"><CubeContainer /></Route>
		</div>
	);
};

export default memo(Main);
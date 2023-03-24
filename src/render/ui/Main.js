import { createElement, useEffect, useState, memo } from "react";

import { getDispatch } from "Store/Global";
import useGlobal from "Hooks/useGlobal";
import { SVG } from "./svg";

import Route from "UI/components/Route";
import CubeContainer from "UI/CubeContainer";
import { Guild, Guilds } from "UI/guilds";
import MainContainer from "UI/MainContainer";


const Main = memo(() => {

	const { selectMainScreen } = getDispatch();
	const currentScreen = useGlobal(global => global.currentMainScreen);

	return (
		<div className="container">
			<Guilds>
				<Guild type="item" svg={SVG('home')} onClick={() => selectMainScreen('home')} selected={currentScreen == 'home'} />
				<Guild type="separator" />
				<Guild type="item" svg={SVG('cube')} onClick={() => selectMainScreen('cube')} selected={currentScreen == 'cube'} />
			</Guilds>
			<Route path="home"><MainContainer /></Route>
			<Route path="cube"><CubeContainer /></Route>
		</div>
	);
});

export default Main;
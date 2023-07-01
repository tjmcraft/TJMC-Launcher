import { createElement, memo } from "react";

import buildClassName from "Util/buildClassName";
import useGlobal from "Hooks/useGlobal";

import Transition from "UI/Transition";
import Route from "UI/Route";


import { SVG } from "UI/svg";
import CubeSidebar from "./CubeContainer/CubeSidebar";
import CubeContent from "./CubeContainer/CubeContent";
import UserIcon from "./UserIcon";



const Main = () => {

	const currentScreen = useGlobal(global => global.currentMainScreen);
	currentScreen && 1;

	return (
		<div className="container">
			<div className={buildClassName("leftColumn", "sidebar")}>
				<div className={buildClassName("discover", "no-scrollbar")}>
					<div className="headerDiscover">
						<h2 className="size24">{"Главная"}</h2>
						<UserIcon />
					</div>
					<div className={buildClassName('categoryItem', "selected")}>
						<div className="innerItem">
							<div className="avatar">{SVG('compass')}</div>
							<div className="content">{"Main"}</div>
						</div>
					</div>
					<div className={buildClassName('categoryItem', "")}>
						<div className="innerItem">
							<div className="avatar">{SVG('map')}</div>
							<div className="content">{"Map"}</div>
						</div>
					</div>
				</div>
				<div className="separator" />
				<CubeSidebar />
			</div>
			<div className={buildClassName("middleColumn", "content")}>
				<Route path="cube">
					<CubeContent />
				</Route>
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
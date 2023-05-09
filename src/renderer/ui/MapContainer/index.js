import MainSidebar from "UI/MainSidebar";
import { SVG } from "UI/svg";
import buildClassName from "Util/buildClassName";
import { useState, useCallback, createElement, memo } from "react";

const mockedWarps = [
	{
		world: "d2d4c8c5-5f42-4469-b939-19ead4cf1e67",
		'world-name': "creative",
		x: "-68.55669832247919",
		y: "69.0",
		z: "-1112.0138670998574",
		yaw: "-178.6103515625",
		pitch: "19.78488540649414",
		name: "osu",
		lastowner: "130ef346-8ed3-3c92-8783-01c0a3aea9d8",
	}
];

const SidebarItem = ({ id, onClick, selected, title, subtitle }) => {
	const handleClick = useCallback(() => {
		onClick(id);
	}, [onClick, id]);
	return (
		<div className={buildClassName('categoryItem', selected && "selected")} onClick={handleClick}>
			<div className="innerItem">
				<div className="avatar">{SVG('compass')}</div>
				<div className="content">
					<h2>{title}</h2>
					<span>{subtitle}</span>
				</div>
			</div>
		</div>
	);
};

const Sidebar = ({
	currentScreen,
	onScreenSelect,
}) => {
	const handleSelect = (screen) => (e) => onScreenSelect(screen);
	const items = mockedWarps;
	return (
		<div className={buildClassName('scroller', 'thin-s')}>
			<h2 className={buildClassName('headerDiscover', 'size24')}>{"Карта"}</h2>
			{items && items.map((item, index) => (
				<SidebarItem
					key={index}
					id={item.name}
					selected={currentScreen == item.name}
					title={item.name}
					subtitle={item["world-name"]}
					onClick={handleSelect(item.name)}
				/>
			))}
		</div>
	);
};

const MainContent = ({ currentScreen }) => {
	const item = mockedWarps.find(e => e.name == currentScreen);
	let link = "https://map.tjmc.ru";
	if (item) {
		const u_link = new URL(link);
		u_link.search = new URLSearchParams({
			mapname: 'flat',
			zoom: '5',
			worldname: item["world-name"],
			x: Math.ceil(Number(item.x)).toString(),
			y: Math.ceil(Number(item.y)).toString(),
			z: Math.ceil(Number(item.z)).toString(),
		}).toString();
		link = u_link.toString();
	}
	return (
		<div className={buildClassName("main-content", "no-scroll")}>
			<iframe src={link} seamless={true} />
		</div>
	);
};

const MapContainer = () => {
	const [activeScreen, setScreen] = useState("main");
	const handleScreenSelect = useCallback((screen) => {
		setScreen(screen);
	}, [setScreen]);
	return (
		<div className="base" id="cube">
			<div className="content">
				<MainSidebar>
					<Sidebar
						currentScreen={activeScreen}
						onScreenSelect={handleScreenSelect}
					/>
				</MainSidebar>
				<MainContent currentScreen={activeScreen} />
			</div>
		</div>
	);
};

export default memo(MapContainer);
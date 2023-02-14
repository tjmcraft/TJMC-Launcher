import { createElement, memo, useMemo, useCallback } from "react";
import buildClassName from "Util/buildClassName";
import { SVG } from "../svg";

const items = [
	{
		id: "main",
		icon: "compass",
		title: "Обзор",
	},
	{
		id: "news",
		icon: "news",
		title: "Новости",
	},
	{
		id: "virus",
		icon: "virus",
		title: "COVID-19",
	},
	{
		id: "map",
		icon: "map",
		title: "Карта",
	},
];

const SidebarItem = memo(({ id, onClick, selected, icon, title }) => {
	const handleClick = useCallback(() => {
		onClick(id);
	}, [onClick, id]);
	return (
		<div className={buildClassName('categoryItem', selected && "selected")} onClick={handleClick}>
			<div className="innerItem">
				<div className="avatar">{SVG(icon)}</div>
				<div className="content">{title}</div>
			</div>
		</div>
	);
});

const Sidebar = memo(({
	currentScreen,
	onScreenSelect,
}) => {

	const handleSelect = (screen) => (e) => {
		onScreenSelect(screen);
	};

	return (
		<div className={buildClassName('scroller', 'thin-s')}>
			<h2 className={buildClassName('headerDiscover', 'size24')}>{"Главная"}</h2>
			{items && items.map((item, index) => (
				<SidebarItem
					key={index}
					id={item.id}
					selected={currentScreen == item.id}
					icon={item.icon}
					title={item.title}
					onClick={handleSelect(item.id)}
				/>
			))}
		</div>
	);
});

export default Sidebar;
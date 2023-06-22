import { createElement, memo, useRef } from "react";

import { getDispatch } from "Store/Global";
import { selectCurrentUser } from "Model/Selectors/user";

import { SVG } from "UI/svg";
import useGlobal from "Hooks/useGlobal";

import Tooltip from "UI/Tooltip";

const UserPanel = memo(() => {
	const { openVersionChooserModal, openSettingsModal } = getDispatch();
	const user = useGlobal(selectCurrentUser);

	const addVersionButton = useRef();
	const settingsButton = useRef();

	if (!user) return null;

	const onAddClick = () => openVersionChooserModal();
	const onSettingsClick = () => openSettingsModal();

	return (
		<div className="panel">
			<div className="container">
				<div className="avatar">
					{(user.avatar != void 0) ? (
						<img src={`https://cdn.tjmc.ru/avatars/${user.id}/${user.avatar}.png?size=64`} />
					) : (
						<img src={`https://api.tjmc.ru/v1/skin.render?user=${user.username}&headOnly=true&vr=-25&hr=35`} />
					)}
				</div>
				<div className="nameTag">
					<div className="title">{user.realname || user.username}</div>
					<div className="subtitle">{`#${user.discriminator}`}</div>
				</div>
				<div className="button" id="add-version-button" ref={addVersionButton} onClick={onAddClick}>{SVG('add-plus')}</div>
				<Tooltip forRef={addVersionButton}>Добавить версию</Tooltip>
				<div className="button" id="settings-button" ref={settingsButton} onClick={onSettingsClick}>{SVG('settings-gear')}</div>
				<Tooltip forRef={settingsButton}>Настройки</Tooltip>
			</div>
		</div>
	);
});

const MainSidebar = ({ children }) => {
	return (
		<div className="sidebar-main">
			<nav className="container-3Wc7">{children}</nav>
			<UserPanel />
		</div>
	);
};

export default memo(MainSidebar);
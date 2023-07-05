import { createElement, memo, useRef } from "react";

import { getDispatch } from "Store/Global";
import { selectCurrentUser } from "Model/Selectors/user";

import useGlobal from "Hooks/useGlobal";

import Tooltip from "UI/Tooltip";

const UserPanel = memo(() => {
	const { openSettings } = getDispatch();
	const user = useGlobal(selectCurrentUser);

	const settingsButton = useRef();

	if (!user) return null;

	const onSettingsClick = () => openSettings();

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
				<div className="button" id="settings-button" ref={settingsButton} onClick={onSettingsClick}><i className="icon-settings"></i></div>
				<Tooltip forRef={settingsButton}>Настройки</Tooltip>
			</div>
		</div>
	);
});

export default memo(UserPanel);
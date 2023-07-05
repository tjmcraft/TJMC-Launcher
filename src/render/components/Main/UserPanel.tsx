import { createElement, memo, useRef } from "react";

import { getDispatch } from "Store/Global";
import { selectCurrentUser } from "Model/Selectors/user";

import useGlobal from "Hooks/useGlobal";

import Tooltip from "UI/Tooltip";
import buildClassName from "Util/buildClassName";

const UserPanel = memo(() => {
	const { selectMainScreen, openSettings } = getDispatch();
	const user = useGlobal(selectCurrentUser);
	const currentMainScreen = useGlobal(global => global.currentMainScreen);

	const mapButton = useRef();
	const settingsButton = useRef();

	if (!user) return null;

	const onMapClick = () => selectMainScreen({ type: 'map' });
	const onSettingsClick = () => openSettings();

	return (
		<div className="panel">
			<div className="container">
				<div className="avatarWrapper" onClick={() => openSettings({ tab: 'my-account' })}>
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
				</div>
				<button ref={mapButton}
					id="map-button"
					className={buildClassName("circle", currentMainScreen.type == 'map' && "filled")}
					onClick={onMapClick}
				>
					<i className="icon-location"/>
				</button>
				<Tooltip forRef={mapButton}>Карта</Tooltip>
				<button ref={settingsButton}
					id="settings-button"
					className="circle"
					onClick={onSettingsClick}
				>
					<i className="icon-settings"/>
				</button>
				<Tooltip forRef={settingsButton}>Настройки</Tooltip>
			</div>
		</div>
	);
});

export default memo(UserPanel);
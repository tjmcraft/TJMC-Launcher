import React, { createElement, memo, useRef } from "react";

import { getDispatch } from "Store/Global";
import { selectCurrentUser } from "Model/Selectors/user";

import useGlobal from "Hooks/useGlobal";

import Tooltip from "UI/Tooltip";
import buildClassName from "Util/buildClassName";
import UserIcon from "./UserIcon";

const UserPanel: React.FC<{
	children?: React.ReactNode;
}> = ({ children }) => {
	const { openSettings } = getDispatch();
	const user = useGlobal(selectCurrentUser);
	return user && (
		<div className="panel">
			<div className="container">
				<div className="avatarWrapper" onClick={() => openSettings({ tab: 'my-account' })}>
					<UserIcon />
					<div className="nameTag">
						<div className="title">{user.realname || user.username}</div>
						<div className="subtitle">{`#${user.discriminator}`}</div>
					</div>
				</div>
				{children}
			</div>
		</div>
	);
};

export default memo(UserPanel);
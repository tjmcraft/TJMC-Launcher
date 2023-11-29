import { createElement, forwardRef, memo } from "react";

import { selectCurrentUser } from "Model/Selectors/user";

import useGlobal from "Hooks/useGlobal";
import buildClassName from "Util/buildClassName";

import headImage from "IMG/default_head.png";

const UserIcon = forwardRef<HTMLDivElement,any>((props, ref) => {
	const user = useGlobal(selectCurrentUser);

	if (!user) return null;
	return (
		<div className={buildClassName("avatar")} ref={ref} {...props}>
			<img
				src={user.avatar != void 0 ?
				`https://cdn.tjmc.ru/avatars/${user.id}/${user.avatar}.png?size=256` :
				`https://api.tjmc.ru/v1/skin.render?user=${user.username}&headOnly=true&vr=-25&hr=35`}
				onError={({ currentTarget }) => {
					currentTarget.onerror = void 0;
					currentTarget.src = headImage;
				}}
			/>

		</div>
	);
});

export default memo(UserIcon);
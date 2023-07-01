import { createElement, forwardRef, memo } from "react";

import { selectCurrentUser } from "Model/Selectors/user";

import useGlobal from "Hooks/useGlobal";

const UserIcon = forwardRef<HTMLDivElement,any>((props, ref) => {
	const user = useGlobal(selectCurrentUser);

	if (!user) return null;
	return (
		<div className="avatar" ref={ref} {...props}>
		{(user.avatar != void 0) ? (
			<img src={`https://cdn.tjmc.ru/avatars/${user.id}/${user.avatar}.png?size=64`} />
		) : (
			<img src={`https://api.tjmc.ru/v1/skin.render?user=${user.username}&headOnly=true&vr=-25&hr=35`} />
		)}
	</div>
	);
});

export default memo(UserIcon);
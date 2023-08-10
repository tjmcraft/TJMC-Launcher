import { randomString } from "Util/Random";
import { memo, createElement, useCallback } from "react";
import SettingContainer from "../SettingContainer";
import buildClassName from "Util/buildClassName";

const SettingButton = ({
	id = undefined,
	title,
	note = undefined,
	name,
	action = void 0,
}) => {
	id = id || randomString(5);
	const handleClick = useCallback(() => {
		if (typeof action === "function") action.call(this, id);
	}, [id, action]);
	return (
		<SettingContainer note={note} title={title} forId={id}>
			<button id={id} className={buildClassName("filled", "small")} onClick={handleClick}>{name || "click"}</button>
		</SettingContainer>
	);
};

export default memo(SettingButton);
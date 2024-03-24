import React, { memo, createElement, useCallback } from "react";

import { randomString } from "Util/Random";

import SettingContainer from "../SettingContainer";
import buildClassName from "Util/buildClassName";

const SettingButton: React.FC<{
	id?: string;
	title: string;
	note?: string;
	name: string;
	action?: AnyToVoidFunction;
}> = ({
	id = undefined,
	title,
	note = undefined,
	name,
	action = () => {},
}) => {
	id = id || randomString(5);
	const handleClick = useCallback(() => {
		if (typeof action === "function") action.call(this, id);
	}, [id, action]);
	return (
		<SettingContainer note={note} title={title} onTitleClick={handleClick}>
			<button id={id} className={buildClassName("filled", "small")} onClick={handleClick}>{name || "click"}</button>
		</SettingContainer>
	);
};

export default memo(SettingButton);
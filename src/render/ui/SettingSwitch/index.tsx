import React, { memo, createElement, useCallback } from "react";

import { randomString } from "Util/Random";

import SettingContainer from "../SettingContainer";
import ToggleSwitch from "../ToggleSwitch";

const SettingSwitch: React.FC<{
	id?: string;
	title: string;
	note?: string;
	action?: AnyToVoidFunction;
	checked?: boolean;
	disabled?: boolean;
}> = ({
	id = undefined,
	title,
	note = undefined,
	action = () => {},
	checked = false,
	disabled = false,
}) => {
	id = id || randomString(5);
	const onCheck = useCallback(() => {
		if (typeof action === "function" && !disabled) action.call(this, !checked, id);
	}, [id, action, checked, disabled]);
	return (
		<SettingContainer note={note} title={title} onTitleClick={onCheck} disabled={disabled}>
			<ToggleSwitch id={id} checked={Boolean(checked)} onChange={onCheck} />
		</SettingContainer>
	);
};

export default memo(SettingSwitch);
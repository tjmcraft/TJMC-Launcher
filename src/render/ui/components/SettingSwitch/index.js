import { randomString } from "Util/Random";
import { memo, createElement, useCallback } from "react";
import SettingContainer from "../SettingContainer";
import ToggleSwitch from "../ToggleSwitch";

const SettingSwitch = ({
	id = undefined,
	title,
	note = undefined,
	action = void 0,
	checked = false,
	disabled = false,
}) => {
	id = id || randomString(5);
	const onCheck = useCallback(() => {
		if (typeof action === "function" && !disabled) action.call(this, !checked, id);
	}, [id, action, checked, disabled]);
	return (
		<SettingContainer note={note} title={title} forId={id} disabled={disabled}>
			<ToggleSwitch id={id} checked={Boolean(checked)} onChange={onCheck} />
		</SettingContainer>
	);
};

export default memo(SettingSwitch);
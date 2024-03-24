import React, { FC, createElement, memo } from "react";

import style from "CSS/toggleswitch.module.css";

type OwnProps = {
	id: string;
	checked: boolean;
	onChange: AnyFunction;
	disabled?: boolean;
};

const ToggleSwitch: FC<OwnProps> = ({
	id,
	checked,
	onChange,
	disabled = false
}) => {
	return (
		<label className={style.toggleSwitch}>
			<input type="checkbox" id={id} checked={checked} onClick={onChange} disabled={disabled} />
			<span className={style.slider} />
		</label>
	);
};

export default memo(ToggleSwitch);
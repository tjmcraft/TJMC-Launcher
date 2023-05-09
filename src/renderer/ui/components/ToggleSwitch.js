import { createElement, memo } from "react";

import style from "CSS/toggleswitch.module.css";


const ToggleSwitch = ({ id, checked, onChange, disabled = false }) => {
	return (
		<label className={style.toggleSwitch}>
			<input type="checkbox" id={id} checked={checked} onChange={onChange} disabled={disabled} />
			<span className={style.slider} />
		</label>
	);
};

export default memo(ToggleSwitch);
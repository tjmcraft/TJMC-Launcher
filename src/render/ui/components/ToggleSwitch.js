import { createElement, memo } from "react";

import style from "CSS/toggleswitch.module.css";


const ToggleSwitch = ({ id, checked, onChange }) => {
	return (
		<label className={style.toggleSwitch}>
			<input type="checkbox" id={id} checked={checked} onChange={onChange} />
			<span className={style.slider} />
		</label>
	);
};

export default memo(ToggleSwitch);
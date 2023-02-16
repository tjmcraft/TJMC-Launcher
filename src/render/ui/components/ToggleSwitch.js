import { createElement, memo } from "react";

import style from "CSS/toggleswitch.module.css";


const ToggleSwitch = ({ id, checked, onChange }) => {
	const handleChange = function (e) {
		e.preventDefault();
		if (e.target) {
			const value = Boolean(e.target.checked);
			if (typeof onChange === 'function') onChange.call(e.target, value);
		}
	};
	return (
		<label className={style.toggleSwitch}>
			<input type="checkbox" id={id} checked={checked} onClick={handleChange} />
			<span className={style.slider} />
		</label>
	);
};

export default memo(ToggleSwitch);
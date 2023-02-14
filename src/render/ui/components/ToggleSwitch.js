import { createElement, memo } from "react";
import style from "CSS/toggleswitch.module.css";

const ToggleSwitch = memo(({id, checked, onChange}) => {
	const handleChange = function (e) {
		e.preventDefault();
		if (e.target) {
			const value = Boolean(e.target.checked);
			if (typeof onChange === 'function') onChange.call(e.target, value);
		}
	};
	return (
		<label class={style.toggleSwitch}>
			<input type="checkbox" id={id} checked={checked} onClick={handleChange} />
			<span class={style.slider} />
		</label>
	);
});

export default ToggleSwitch;
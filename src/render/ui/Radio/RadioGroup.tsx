import { createElement, memo } from "react";

import buildClassName from "Util/buildClassName";
import { randomString } from "Util/Random";

import RadioItem from "./RadioItem";
import style from "./radio.module.css";

const RadioGroup = ({
	id = undefined,
	options,
	direction,
	checked,
	action = void 0
}) => {

	id = id || randomString(5);

	const handleClick = (i) => {
		return () => {
			typeof action === "function" &&
			action.call(this, i);
		};
	};

	const fullClassName = buildClassName(
		style.radioGroup,
		direction == 'vertical' ? style.vertical : (direction == 'horizontal' && style.horizontal)
	);

	return (
		<div className={fullClassName} id={id}>
			{Object.entries(options).map(([i, e]) => (
				<RadioItem key={i}
					id={`RadioGroup-${id}-${i}`}
					checked={checked == i}
					onClick={handleClick(i)}
				>{e}</RadioItem>
			))}
		</div>
	);
};

export default memo(RadioGroup);
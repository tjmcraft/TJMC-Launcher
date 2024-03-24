import React, { createElement, memo } from "react";

import buildClassName from "Util/buildClassName";
import { randomString } from "Util/Random";

import RadioItem from "./RadioItem";
import style from "./radio.module.css";

type OwnProps<T extends string = string> = {
	id?: string;
	options: Record<T, string | JSX.Element>;
	direction: 'vertical' | 'horizontal';
	checked?: T;
	action: AnyToVoidFunction;
}

const RadioGroup: React.FC<OwnProps> = ({
	id = undefined,
	options,
	direction,
	checked = false,
	action = () => {},
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
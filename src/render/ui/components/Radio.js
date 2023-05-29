import { createElement } from "react";

import buildClassName from "Util/buildClassName.js";
import { randomString } from "Util/Random.js";
import { SVG } from "../svg.js";

import style from "CSS/radio.module.css";

const RadioGroup = ({
	id = undefined,
	options,
	direction,
	checked,
	action = void 0
}) => {

	id = id || randomString(5);

	const handleClick = (i) => {
		return (e) => {
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

const RadioItem = ({ id, checked, onClick, children }) => {
	id = id || randomString(5);
	return (
		<div className={style.item} data-id={id} aria-checked={checked} onClick={onClick}>
			<div className={style.radioBar}>
				<div className={style.radio}>{ checked ? SVG('radio-checked') : SVG('radio') }</div>
				<div className={style.info}>{children}</div>
			</div>
		</div>
	);
};

export { RadioGroup };

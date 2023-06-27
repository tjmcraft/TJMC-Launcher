import { createElement, memo } from "react";
import { randomString } from "Util/Random";

import { SVG } from "UI/svg";
import style from "./radio.module.css";

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


export default memo(RadioItem);
import React, { createElement, memo } from "react";
import { randomString } from "Util/Random";


import style from "./radio.module.css";
import buildClassName from "Util/buildClassName";

const RadioItem: React.FC<{
	id?: string;
	checked?: boolean;
	onClick?: AnyToVoidFunction;
	children: React.ReactNode;
}> = ({
	id = undefined,
	checked = false,
	onClick = () => {},
	children
}) => {
	id = id || randomString(5);
	return (
		<div className={style.item} data-id={id} aria-checked={checked} onClick={onClick}>
			<div className={style.radioBar}>
				<div className={buildClassName(style.radio, checked && style.checked)}></div>
				<div className={style.info}>{children}</div>
			</div>
		</div>
	);
};


export default memo(RadioItem);
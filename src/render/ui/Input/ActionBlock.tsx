import { createElement, memo } from "react";

import style from "./input.module.css";

const ActionBlock = (props) => {
	return (
		<div className={style.actionBlock}>
			{props.children}
		</div>
	);
};

export default memo(ActionBlock);
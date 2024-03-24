import React, { createElement, memo } from "react";

import style from "./input.module.css";

const ActionBlock: React.FC<{ children: React.ReactNode }> = (props) => {
	return (
		<div className={style.actionBlock}>
			{props.children}
		</div>
	);
};

export default memo(ActionBlock);
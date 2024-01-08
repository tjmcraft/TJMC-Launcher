import React, { createElement, memo } from "react";

import style from "./input.module.css";

const InputGroup: React.FC<{
	htmlFor: React.LabelHTMLAttributes<HTMLLabelElement>['htmlFor'];
	inRef: React.ClassAttributes<HTMLSpanElement>['ref'];
	title?: string;
	children: React.ReactNode;
}> = ({
	htmlFor,
	inRef = undefined,
	title = undefined,
	children,
}) => {
	return (
		<div className={style.inputGroup}>
			{title && (
				<span className={style.head}>
					<label htmlFor={htmlFor}>{title}</label>
				</span>
			)}
			<span className={style.inputWrapper} ref={inRef}>{children}</span>
		</div>
	);
};

export default memo(InputGroup);
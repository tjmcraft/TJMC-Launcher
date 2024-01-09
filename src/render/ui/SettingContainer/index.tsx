import React, { memo, createElement } from "react";

import style from './index.module.css';
import buildClassName from "Util/buildClassName";

const SettingContainer: React.FC<{
	inputMode?: boolean;
	note?: string | JSX.Element;
	title?: string;
	onTitleClick?: AnyToVoidFunction;
	disabled?: boolean;
	children?: React.ReactNode;
}> = ({
	inputMode = false,
	note = undefined,
	title = undefined,
	onTitleClick = () => void 0,
	disabled = false,
	children = undefined,
}) => {
	if (inputMode) {
		return (
			<div className={buildClassName(style.settingContainer, disabled && style.disabled)}>
				<div className={style.description}>{note || ""}</div>
				{children}
			</div>
		);
	}
	return (
		<div className={buildClassName(style.settingContainer, disabled && style.disabled)}>
			<div className={style.labelRow}>
				{title && <label onClick={onTitleClick} className={style.title}>{title || ""}</label>}
				<div className={style.control}>
					{children}
				</div>
			</div>
			{note && (
				<div className={style.note}>
					<div className={style.description}>{note}</div>
				</div>
			)}
		</div>
	);
};

export default memo(SettingContainer);
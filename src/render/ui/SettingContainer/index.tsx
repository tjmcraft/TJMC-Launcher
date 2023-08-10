import { memo, createElement } from "react";

import style from './index.module.css';
import buildClassName from "Util/buildClassName";

const SettingContainer = ({
	inputMode = false,
	note = undefined,
	title = undefined,
	forId = undefined,
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
				{title && <label htmlFor={forId} className={style.title}>{title || ""}</label>}
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
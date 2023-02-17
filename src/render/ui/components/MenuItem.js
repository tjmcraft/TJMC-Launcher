import { createElement, memo, useCallback } from "react";

import buildClassName from "Util/buildClassName";


const MenuItem = ({
	children,
	onClick = void 0,
	disabled = false,
	className = undefined,
	compact = false,
	destructive = false,
	withWrap = false,
	selected = false,
}) => {

	const handleClick = useCallback((e) => {
		if (disabled || !onClick) {
			e.stopPropagation();
			e.preventDefault();

			return;
		}
		onClick(e);
	}, [disabled, onClick]);

	const fullClassName = buildClassName(
		"menuItem",
		className,
		selected && "selected",
		disabled && 'disabled',
		destructive && 'destructive',
		compact && 'compact',
		withWrap && 'wrap',
	);

	return (
		<div
			role="menuitem"
			tabIndex={0}
			onClick={handleClick}
			className={fullClassName}
		>
			{children}</div>
	);

};

export default memo(MenuItem);
import { createElement, useCallback } from "react";

import buildClassName from "Util/buildClassName";


const MenuItem = ({ children, onClick, disabled, className, compact, destructive, withWrap, selected }) => {

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

export default MenuItem;
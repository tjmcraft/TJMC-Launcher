import { createElement, memo } from "react";

import './Tooltip.css';

const Tooltip = ({
	children,
	style = undefined
}) => {
	return (
		<div className="tooltip" style={style}>
			<div className="pointer" />
			<div className="content">{children}</div>
		</div>
	);
};

export default memo(Tooltip);
import { createElement, memo } from "react";

import './Tooltip.css';
import useShowTransition from "Hooks/useShowTransition";
import buildClassName from "Util/buildClassName";

const Tooltip = ({
	children,
	style = undefined,
	isOpen = false,
	onCloseEnd = void 0,
}) => {
	const { transitionClassNames } = useShowTransition(isOpen, onCloseEnd, false, undefined, false, undefined, 100);
	return (
		<div className={buildClassName("tooltip", transitionClassNames)} style={style}>
			<div className="pointer" />
			<div className="content">{children}</div>
		</div>
	);
};

export default memo(Tooltip);
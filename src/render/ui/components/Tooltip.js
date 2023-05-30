import { createElement, forwardRef, memo } from "react";

import './Tooltip.css';
import useShowTransition from "Hooks/useShowTransition";
import buildClassName from "Util/buildClassName";

const Tooltip = forwardRef(({
	children,
	style = undefined,
	isOpen = false,
	onCloseEnd = void 0,
	positionX,
}, ref) => {
	const { transitionClassNames } = useShowTransition(isOpen, onCloseEnd, false, undefined, false, undefined, 100);
	return (
		<div className={buildClassName("tooltip", positionX, transitionClassNames)} style={style} ref={ref}>
			<div className="pointer" />
			<div className="content">{children}</div>
		</div>
	);
});

export default memo(Tooltip);
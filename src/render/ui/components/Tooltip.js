import { createElement, forwardRef, memo, useCallback, useRef } from "react";

import './Tooltip.css';
import useShowTransition from "Hooks/useShowTransition";
import buildClassName from "Util/buildClassName";
import useTooltip from "Hooks/useTooltip";
import useTooltipPosition from "Hooks/useTooltipPosition";
import Portal from "./Portal";
import { useEffect } from "react";

const Tooltip = forwardRef(({
	children,
	style = undefined,
	isOpen = false,
	onCloseEnd = void 0,
	positionX,
}, ref) => {
	const { transitionClassNames, shouldRender } = useShowTransition(isOpen, onCloseEnd, false, undefined, false, undefined, 100);
	return (
		<div className={buildClassName("tooltip", positionX, transitionClassNames)} style={style} ref={ref}>
			<div className="pointer" />
			<div className="content">{children}</div>
		</div>
	);
});

const TooltipWrapper = ({ forRef, children }) => {
	const tooltipRef = useRef();
	const { isTooltipOpen, handleMouseEnter, handleMouseLeave } = useTooltip();
	const getTriggerElement = useCallback(() => forRef.current, [forRef]);
	const getTooltipElement = useCallback(() => tooltipRef.current, []);
	const { positionX, style } = useTooltipPosition(getTriggerElement, getTooltipElement);

	useEffect(() => {
		let ref = null;
		if (!forRef.current) return;
		ref = forRef.current;
		forRef.current.addEventListener('mouseenter', handleMouseEnter);
		forRef.current.addEventListener('mouseleave', handleMouseLeave);
		return () => {
			ref?.removeEventListener('mouseenter', handleMouseEnter);
			ref?.removeEventListener('mouseleave', handleMouseLeave);
		};
	}, [forRef, handleMouseEnter, handleMouseLeave]);

	return (
		<Portal>
			<Tooltip isOpen={isTooltipOpen} style={style} positionX={positionX} ref={tooltipRef}>{children}</Tooltip>
		</Portal>
	);
};

export default memo(TooltipWrapper);
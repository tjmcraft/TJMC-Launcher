import { createElement, forwardRef, memo, useCallback, useRef, useEffect } from "react";

import buildClassName from "Util/buildClassName";
import useFlag from "Hooks/useFlag";
import useTooltipPosition from "Hooks/useTooltipPosition";
import useShowTransition from "Hooks/useShowTransition";

import Portal from "./Portal";
import './Tooltip.css';

/**
 * @typedef {Object} Props
 * @property {boolean|undefined} isOpen
 * @property {React.Component} children
 * @property {Function|undefined} onCloseEnd
 * @property {React.StyleHTMLAttributes|undefined} style
 * @property {'left'|'right'} positionX
 */

/**
 * @type React.ForwardRefExoticComponent<?,Props>
 */
const Tooltip = forwardRef(({
	isOpen = false,
	children,
	onCloseEnd = void 0,
	style = undefined,
	positionX = undefined,
}, ref) => {
	const { transitionClassNames, shouldRender } = useShowTransition(isOpen, onCloseEnd, false, undefined, false, undefined, 100);
	return shouldRender && (
		<Portal>
			<div className={buildClassName("tooltip", positionX, transitionClassNames)} style={style} ref={ref}>
				<div className="pointer" />
				<div className="content">{children}</div>
			</div>
		</Portal>
	);
});

const TooltipWrapper = ({ forRef, children, isOpen = false }) => {
	const tooltipRef = useRef();
	const [isTooltipOpen, handleMouseEnter, handleMouseLeave] = useFlag(false);
	const getTriggerElement = () => forRef.current;
	const getTooltipElement = () => tooltipRef.current;
	const { positionX, style } = useTooltipPosition(getTriggerElement, getTooltipElement);

	useEffect(() => {
		if (!forRef.current) return;
		let ref = null;
		ref = forRef.current;
		forRef.current.addEventListener('mouseenter', handleMouseEnter);
		forRef.current.addEventListener('mouseleave', handleMouseLeave);
		return () => {
			ref?.removeEventListener('mouseenter', handleMouseEnter);
			ref?.removeEventListener('mouseleave', handleMouseLeave);
		};
	}, [forRef, handleMouseEnter, handleMouseLeave]);

	return (
		<Tooltip isOpen={isOpen || isTooltipOpen} style={style} positionX={positionX} ref={tooltipRef}>{children}</Tooltip>
	);
};

export default memo(TooltipWrapper);
import { createElement, memo, useRef, useEffect, ReactNode, FC } from "react";

import useFlag from "Hooks/useFlag";
import useTooltipPosition from "Hooks/useTooltipPosition";
import Tooltip from "./Tooltip";

import './Tooltip.css';

type WrapperProps = {
	forRef: any;
	children: ReactNode;
	isOpen?: boolean;
};

const TooltipWrapper: FC<WrapperProps> = ({ forRef, children, isOpen = false }) => {
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
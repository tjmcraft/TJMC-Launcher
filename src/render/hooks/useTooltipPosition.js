import { useEffect, useState } from "react";

const EMPTY_RECT = {
	width: 0, left: 0, height: 0, top: 0,
};

export default function useTooltipPosition(
	getTriggerElement,
	getTooltipElement,
) {

	const [positionX, setPositionX] = useState('top');
	const [style, setStyle] = useState('');
	const margin = 5;

	useEffect(() => {
		const triggerEl = getTriggerElement();
		const tooltipEl = getTooltipElement();

		if (!triggerEl) return;

		const triggerRect = triggerEl.getBoundingClientRect();
		const tooltipRect = tooltipEl ? {
			width: tooltipEl.offsetWidth,
			height: tooltipEl.offsetHeight,
		} : EMPTY_RECT;

		let horizontalPosition;

		let x1 = ((triggerEl.offsetWidth - tooltipRect.width) / 2) + triggerRect.left;
		const left = x1 > 0 ? x1 : 0;

		let y = 0;
		let yt = triggerRect.top - margin - tooltipRect.height;
		let yb = triggerRect.top + triggerEl.offsetHeight + margin;
		if (yt - 25 > 0) {
			horizontalPosition = 'top';
			y = yt;
		} else if (yb) {
			horizontalPosition = 'bottom';
			y = yb;
		}
		setPositionX(horizontalPosition);
		const top = y;

		setStyle(`left: ${left}px; top: ${top}px`);
	}, [getTriggerElement, getTooltipElement]);

	return { positionX, style };

}
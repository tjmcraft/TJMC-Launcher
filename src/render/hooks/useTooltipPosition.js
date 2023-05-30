import { useEffect, useState } from "react";

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

		const triggerRect = triggerEl.getBoundingClientRect();

		const anchorX = triggerRect.left;
		const anchorY = triggerRect.top;

		let horizontalPosition;

		let x1 = ((triggerEl.offsetWidth - tooltipEl.offsetWidth) / 2) + triggerRect.left;
		const left = x1 > 0 ? x1 : 0;

		let y = 0;
		let yt = triggerRect.top - margin - tooltipEl.offsetHeight;
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
import { useCallback, useEffect, useState } from "react";

const useTooltip = () => {

	const [isTooltipOpen, setIsTooltipOpen] = useState(false);
	const [tooltipPosition, setTooltipPosition] = useState({x:0,y:0});

	const handleMouseEnter = useCallback((e) => {
		const target = e.target;
		const rect = target.getBoundingClientRect();
		// console.debug(rect);
		setIsTooltipOpen(true);
		setTooltipPosition({ x: rect.x, y: rect.y });
	}, []);
	const handleMouseLeave = useCallback(() => {
		setIsTooltipOpen(false);
	}, []);

	return {
		isTooltipOpen,
		tooltipPosition,
		handleMouseEnter,
		handleMouseLeave,
	}
};

export default useTooltip;
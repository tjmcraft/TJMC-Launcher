import { useEffect, useState } from "react";

const MENU_POSITION_VISUAL_COMFORT_SPACE_PX = 16;
const MENU_POSITION_BOTTOM_MARGIN = 12;
const EMPTY_RECT = {
	width: 0, left: 0, height: 0, top: 0,
};

export default function useContextMenuPosition(
	anchor,
	getTriggerElement,
	getRootElement,
	getMenuElement,
	getLayout = undefined,
) {
	const [positionX, setPositionX] = useState('top');
	const [positionY, setPositionY] = useState('left');
	const [transformOriginX, setTransformOriginX] = useState();
	const [transformOriginY, setTransformOriginY] = useState();
	const [withScroll, setWithScroll] = useState(false);
	const [style, setStyle] = useState('');
	const [menuStyle, setMenuStyle] = useState('opacity: 0;');

	useEffect(() => {
		const triggerEl = getTriggerElement();
		if (!anchor || !triggerEl) {
			return;
		}

		let { x, y } = anchor;
		const anchorX = x;
		const anchorY = y;

		const menuEl = getMenuElement();
		const rootEl = getRootElement();

		const {
			extraPaddingX = 0,
			extraTopPadding = 0,
			marginSides = 0,
			extraMarginTop = 0,
			withPortal = false
		} = getLayout?.() || {};

		const marginTop = menuEl ? parseInt(getComputedStyle(menuEl).marginTop, 10) + extraMarginTop : undefined;

		const menuRect = menuEl ? {
			width: menuEl.offsetWidth,
			height: menuEl.offsetHeight + marginTop,
		} : EMPTY_RECT;

		const rootRect = rootEl ? rootEl.getBoundingClientRect() : EMPTY_RECT;

		let horizontalPosition;
		let verticalPosition;
		if (x + menuRect.width + extraPaddingX < rootRect.width + rootRect.left) {
			x += 3;
			horizontalPosition = 'left';
		} else if (x - menuRect.width > 0) {
			horizontalPosition = 'right';
			x -= 3;
		} else {
			horizontalPosition = 'left';
			x = 16;
		}
		setPositionX(horizontalPosition);

		if (marginSides && horizontalPosition === 'right' &&
			(x + extraPaddingX + marginSides >= rootRect.width + rootRect.left)
		) {
			x -= marginSides;
		}

		if (marginSides && horizontalPosition === 'left') {
			if (x + extraPaddingX + marginSides + menuRect.width >= rootRect.width + rootRect.left) {
				x -= marginSides;
			} else if (x - marginSides <= 0) {
				x += marginSides;
			}
		}

		if (y + menuRect.height < rootRect.height + rootRect.top) {
			verticalPosition = 'top';
		} else {
			verticalPosition = 'bottom';

			if (y - menuRect.height < rootRect.top + extraTopPadding) {
				y = rootRect.top + rootRect.height;
			}
		}
		setPositionY(verticalPosition);

		const triggerRect = triggerEl.getBoundingClientRect();

		const addedYForPortalPositioning = (withPortal ? triggerRect.top : 0);
		const addedXForPortalPositioning = (withPortal ? triggerRect.left : 0);

		const leftWithPossibleNegative = Math.min(
			x - triggerRect.left,
			rootRect.width - menuRect.width - MENU_POSITION_VISUAL_COMFORT_SPACE_PX,
		);
		const left = (horizontalPosition === 'left'
			? (withPortal
				? Math.max(MENU_POSITION_VISUAL_COMFORT_SPACE_PX, leftWithPossibleNegative)
				: leftWithPossibleNegative)
			: (x - triggerRect.left)) + addedXForPortalPositioning;
		const top = y - triggerRect.top + addedYForPortalPositioning;

		const menuMaxHeight = rootRect.height - MENU_POSITION_BOTTOM_MARGIN - (marginTop || 0);

		setWithScroll(menuMaxHeight < menuRect.height);
		setMenuStyle(`max-height: ${menuMaxHeight}px;`);
		setStyle(`left: ${left}px; top: ${top}px`);
		const offsetX = (anchorX + addedXForPortalPositioning - triggerRect.left) - left;
		const offsetY = (anchorY + addedYForPortalPositioning - triggerRect.top) - top - (marginTop || 0);
		setTransformOriginX(horizontalPosition === 'left' ? offsetX : menuRect.width + offsetX);
		setTransformOriginY(verticalPosition === 'bottom' ? menuRect.height + offsetY : offsetY);
	}, [
		anchor, getMenuElement, getRootElement, getLayout, getTriggerElement
	]);

	return {
		positionX,
		positionY,
		transformOriginX,
		transformOriginY,
		style,
		menuStyle,
		withScroll,
	};
}

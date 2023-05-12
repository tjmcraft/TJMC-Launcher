import { createElement, useEffect, useRef, memo, forwardRef } from "react";

import buildClassName from "Util/buildClassName";
import useShowTransition from "Hooks/useShowTransition";
import useVirtualBackdrop from "Hooks/useVirtualBackdrop";
import captureEscKeyListener from "Util/captureEscKeyListener";

/**
 * @typedef {Object} Props
 * @property {boolean|undefined} full
 * @property {boolean|undefined} isOpen
 * @property {React.Component} children
 * @property {Function|undefined} onClose
 * @property {Function|undefined} onCloseEnd
 * @property {React.RefObject|undefined} containerRef
 * @property {React.StyleHTMLAttributes|undefined} style
 * @property {'left'|'right'} positionX
 * @property {'top'|'bottom'} positionY
 * @property {number} transformOriginX
 * @property {number} transformOriginY
 */

/**
 * @type React.ForwardRefExoticComponent<?,Props>
 */
const Menu = forwardRef(({
	full = false,
	isOpen = false,
	children,
	onClose = void 0,
	onCloseEnd = void 0,
	containerRef = undefined,
	style = undefined,
	positionX = undefined, positionY = undefined,
	transformOriginX = undefined, transformOriginY = undefined,
}, ref) => {

	let menuRef = useRef(null);
	if (ref) {
		menuRef = ref;
	}
	const backdropContainerRef = containerRef || menuRef;

	const { transitionClassNames } = useShowTransition(isOpen, onCloseEnd, false, undefined, false, undefined, 200);

	useEffect(() => (isOpen ? captureEscKeyListener(onClose) : undefined), [isOpen, onClose]);

	useVirtualBackdrop(isOpen, backdropContainerRef, onClose);

	const handleClose = (e) => { e.stopPropagation(); onClose(); };

	const transformOriginYStyle = transformOriginY !== undefined ? `${transformOriginY}px` : undefined;
	const transformOriginXStyle = transformOriginX !== undefined ? `${transformOriginX}px` : undefined;

	return (
		<div className={buildClassName("menu", full && "full")} style={style}>
			<div ref={menuRef}
				className={buildClassName(
					positionX, positionY,
					"bubble",
					"menu-container",
					"thin-s",
					transitionClassNames,
				)}
				style={{ transformOrigin: `${transformOriginXStyle || positionX} ${transformOriginYStyle || positionY}` }}
				onClick={handleClose}>
				{children}
			</div>
		</div>
	);
});

export default memo(Menu);
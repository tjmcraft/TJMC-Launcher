import { createElement, useEffect, useRef } from "react";

import buildClassName from "Util/buildClassName";
import useShowTransition from "Hooks/useShowTransition";
import useVirtualBackdrop from "Hooks/useVirtualBackdrop";
import captureEscKeyListener from "Util/captureEscKeyListener";
import { createPortal } from "react-dom";


const Menu = ({
	isOpen,
	children,
	onClose,
	onCloseEnd,
	ref,
	containerRef,
	style,
	positionX, positionY,
	transformOriginX, transformOriginY,
}) => {

	let menuRef = useRef(null);
	if (ref) {
		menuRef = ref;
	}
	const backdropContainerRef = containerRef || menuRef;

	const { transitionClassNames } = useShowTransition(isOpen, onCloseEnd, false, undefined, false, undefined, 200);

	useEffect(() => (isOpen ? captureEscKeyListener(onClose) : undefined), [isOpen, onClose]);

	useVirtualBackdrop(isOpen, backdropContainerRef, onClose);

	const handleClose = (e) => { e.stopPropagation(); onClose(); };

	return (
		<div className={buildClassName("menu")} style={style}>
			<div ref={menuRef}
				className={buildClassName(
					positionX, positionY,
					"bubble",
					"menu-container",
					"thin-s",
					transitionClassNames,
				)}
				style={{ transformOrigin: `${transformOriginX || positionX} ${transformOriginY || positionY}` }}
				onClick={handleClose}>
				{children}
			</div>
		</div>
	);
};

export default Menu;
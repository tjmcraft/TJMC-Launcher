import React, { createElement, CSSProperties, ReactNode, forwardRef, memo } from "react";
import useShowTransition from "Hooks/useShowTransition";
import Portal from "UI/Portal";
import buildClassName from "Util/buildClassName";


type OwnProps = {
	isOpen?: boolean;
	children: ReactNode;
	onCloseEnd?: AnyFunction;
	style?: CSSProperties;
	positionX?: 'top' | 'bottom';
};


const Tooltip = forwardRef<HTMLDivElement,OwnProps>(function Tooltip({
	isOpen = false,
	children,
	onCloseEnd = void 0,
	style = undefined,
	positionX = undefined,
}, ref) {
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

export default memo(Tooltip);
import { createElement, memo, useRef } from "react";
import buildClassName from "Util/buildClassName";
import useShowTransition from "Hooks/useShowTransition";
import forceReflow from "Util/forceReflow";

type OwnProps = {
	children: React.ReactNode;
	className?: string;
	isShown?: boolean;
	shouldTruncate?: boolean;
	duration?: number;
	noOpenTransition?: boolean;
	noCloseTransition?: boolean;
	onCloseTransitionEnd?: NoneToVoidFunction;
	name?: 'push' | 'slide';
};

const TransitionContainer: React.FC<OwnProps> = ({
	children,
	className = undefined,
	isShown = false,
	shouldTruncate = true,
	duration = 350,
	noOpenTransition = false,
	noCloseTransition = false,
	onCloseTransitionEnd = void 0,
	name = 'push',
}) => {

	const containerRef = useRef<HTMLDivElement>();

	const {
		shouldRender,
		transitionClassNames,
	} = useShowTransition(
		isShown,
		onCloseTransitionEnd,
		noOpenTransition,
		`Transition-${name}`,
		noCloseTransition,
		{},
		duration
	);

	if (containerRef.current) forceReflow(containerRef.current);

	return (shouldTruncate ? shouldRender : true) && (
		<div ref={containerRef} className={buildClassName(className, transitionClassNames)}>
			{children}
		</div>
	);
};

export default memo(TransitionContainer);
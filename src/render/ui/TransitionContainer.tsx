import { createElement, memo, useRef } from "react";
import buildClassName from "Util/buildClassName";
import useShowTransition from "Hooks/useShowTransition";
import forceReflow from "Util/forceReflow";

type OwnProps = {
	children: React.ReactNode;
	className?: string;
	isShown: boolean;
	duration?: number;
	noOpenTransition?: boolean;
	noCloseTransition?: boolean;
	onCloseTransitionEnd?: NoneToVoidFunction;
};

const TransitionContainer: React.FC<OwnProps> = ({
	children,
	className = undefined,
	isShown = false,
	duration = 350,
	noOpenTransition = false,
	noCloseTransition = false,
	onCloseTransitionEnd = void 0,
}) => {

	const containerRef = useRef<HTMLDivElement>();

	const {
		shouldRender,
		transitionClassNames,
	} = useShowTransition(
		isShown,
		onCloseTransitionEnd,
		noOpenTransition,
		undefined,
		noCloseTransition,
		{},
		duration
	);

	if (containerRef.current) forceReflow(containerRef.current);

	return shouldRender && (
		<div ref={containerRef} className={buildClassName(className, transitionClassNames)}>
			{children}
		</div>
	);
};

export default memo(TransitionContainer);
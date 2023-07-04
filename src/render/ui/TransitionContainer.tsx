import { createElement, memo } from "react";
import buildClassName from "Util/buildClassName";
import useShowTransition from "Hooks/useShowTransition";

const TransitionContainer = ({ isShown, className = undefined, duration = 350, children }) => {
	const {
		shouldRender,
		transitionClassNames,
	} = useShowTransition(
		isShown, undefined, true, undefined, false, { }, duration
	);

	return shouldRender && (
		<div className={buildClassName(className, transitionClassNames)}>
			{children}
		</div>
	);
};

export default memo(TransitionContainer);
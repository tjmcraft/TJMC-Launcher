import { useEffect, useState } from "react";
import buildClassName from "Util/buildClassName";

type TransitionClasses = {
	open?: string;
	shown?: string;
	closing?: string;
};

const DEFAULT_TRANSITION_CLASSES: TransitionClasses = {
	open: "open",
	shown: "shown",
	closing: "closing",
};

const useShowTransition = (
	isOpen: boolean = false,
	onCloseTransitionEnd: AnyToVoidFunction = null,
	noOpenTransition: boolean = false,
	className: string | false = false,
	noCloseTransition: boolean = false,
	classes: TransitionClasses = DEFAULT_TRANSITION_CLASSES,
	duration: number = 350,
	debug_tag: string = undefined,
) => {
	classes = Object.assign({}, DEFAULT_TRANSITION_CLASSES, classes);
	const [isClosed, setIsClosed] = useState(!isOpen);
	const [hasOpenClassName, setHasOpenClassName] = useState(isOpen && noOpenTransition);

	useEffect(() => {
		let closeTimeout = 0;
		if (isOpen) {
			setIsClosed(false);
			setHasOpenClassName(true);
		} else {
			setHasOpenClassName(false);
			if (!isClosed && !closeTimeout) {
				closeTimeout = window.setTimeout(() => {
					setIsClosed(true);
					if (onCloseTransitionEnd) {
						onCloseTransitionEnd();
					}
					closeTimeout = undefined;
				}, noCloseTransition ? 0 : duration);
			}
		}
		return () => {
			window.clearTimeout(closeTimeout);
			closeTimeout = undefined;
		};
	}, [isOpen]);

	// `noCloseTransition`, when set to true, should remove the open class immediately
	const shouldHaveOpenClassName = hasOpenClassName && !(noCloseTransition && !isOpen);
	const isClosing = Boolean(!isOpen && !isClosed);
	const shouldRender = isOpen || isClosing;
	const transitionClassNames = buildClassName(
		className,
		shouldHaveOpenClassName && classes.open,
		shouldRender && classes.shown,
		isClosing && classes.closing,
	);

	debug_tag && console.debug("[HOOKS]", "{useShowTransition}", `[${debug_tag}]`, "state:", {
		shouldRender, shouldHaveOpenClassName, isClosing
	});

	return {
		shouldRender,
		transitionClassNames,
		hasShownClass: shouldRender,
		hasOpenClass: shouldHaveOpenClassName,
	};
};

export default useShowTransition;

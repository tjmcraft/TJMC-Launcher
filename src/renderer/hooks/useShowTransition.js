import { useEffect, useRef, useState } from "react";
import buildClassName from "Util/buildClassName";


const useShowTransition = (
  isOpen = false,
  onCloseTransitionEnd = null,
  noOpenTransition = false,
  className = null,
  noCloseTransition = false,
  classes = {},
  duration = 350
) => {
  classes = Object.assign({ open: "open", shown: "shown", closing: "closing" }, classes);
  const [isClosed, setIsClosed] = useState(!isOpen);
  const closeTimeoutRef = useRef();
  // СSS class should be added in a separate tick to turn on CSS transition.
  const [hasOpenClassName, setHasOpenClassName] = useState(isOpen && noOpenTransition);

  // `noCloseTransition`, when set to true, should remove the open class immediately
  const shouldHaveOpenClassName = hasOpenClassName && !(noCloseTransition && !isOpen);
  const isClosing = Boolean(closeTimeoutRef.current);
  const shouldRender = isOpen || isClosing;
  const transitionClassNames = buildClassName(
    className && 'opacity-transition',
    className,
    shouldHaveOpenClassName && classes.open,
    shouldRender && classes.shown,
    isClosing && classes.closing,
  );

  useEffect(() => { // open after render
    if (isOpen) {
      setIsClosed(false);
      setHasOpenClassName(true);

      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = undefined;
      }
    }
  }, [isOpen]);

  if (!isOpen) { // close before render
    setHasOpenClassName(false);

    if (!isClosed && !closeTimeoutRef.current) {
      const exec = () => {
        setIsClosed(true);

        if (onCloseTransitionEnd) {
          onCloseTransitionEnd();
        }

        closeTimeoutRef.current = undefined;
      };

      if (noCloseTransition) {
        exec();
      } else {
        closeTimeoutRef.current = window.setTimeout(exec, duration);
      }
    }
  }


  return {
    shouldRender,
    transitionClassNames,
    hasShownClass: shouldRender,
    hasOpenClass: shouldHaveOpenClassName,
  };
};

export default useShowTransition;

import usePrevious from "Hooks/usePrevious";
import useShowTransition from "Hooks/useShowTransition";
import buildClassName from "Util/buildClassName";
import forceReflow from "Util/forceReflow";
// import forceReflow from "Util/forceReflow";
import { createElement, FC, ReactNode, useLayoutEffect, useRef } from "react";

import "./Transition.css";

export type ChildrenFn = (isActive: boolean, isFrom: boolean, currentKey: number) => React.ReactNode;
export type TransitionProps = {
  activeKey: number;
  renderCount?: number;
  className?: string;
  children: React.ReactNode | ChildrenFn;
};

const Transition: FC<TransitionProps> = ({
  activeKey,
  renderCount,
  className,
  children,
}) => {

  const rendersRef = useRef<Record<number, React.ReactNode | ChildrenFn>>({});
  const prevActiveKey = usePrevious<any>(activeKey);

  const activeKeyChanged = prevActiveKey !== undefined && activeKey !== prevActiveKey;

  if (!renderCount && activeKeyChanged) {
    rendersRef.current = { [prevActiveKey]: rendersRef.current[prevActiveKey] };
  }

  rendersRef.current[activeKey] = children;

  useLayoutEffect(() => {});

  const renders = rendersRef.current;
  const renderKeys = Object.keys(renderCount ? new Array(renderCount).fill(undefined) : renders).map(Number);
  const contents = renderKeys.map((key) => {
    const render = renders[key];
    if (!render) {
      return undefined;
    }

    return (
      <TransitionElement key={key} isActive={key === activeKey} firstMount={renderKeys.length <= 1} className={"trans-" + key} >
        {
          typeof render === 'function'
            ? render(key === activeKey, key === prevActiveKey, activeKey)
            : render
        }
      </TransitionElement>
    );
  });

  return (
    <div className={buildClassName('TransitionWrap', className)}>
      {contents}
    </div>
  );
};

export default Transition;

const TRANSITION_DURATION = 250;

const TransitionElement = ({ children, className, isActive, firstMount }: {
  children: ReactNode;
  className?: string;
  isActive: boolean;
  firstMount: boolean;
}) => {

  const ref = useRef();

  const {
		shouldRender,
		transitionClassNames,
	} = useShowTransition(
		isActive, undefined, firstMount, undefined, false, { }, TRANSITION_DURATION, className
    );

  if (ref.current) forceReflow(ref.current);

	return shouldRender && (
		<div className={buildClassName("TransitionElement", transitionClassNames, className)} ref={ref}>
			{children}
		</div>
	);
};
import usePrevious from "Hooks/usePrevious";
import buildClassName from "Util/buildClassName";
import { createElement, useRef } from "react";

import "./Transition.css";
import TransitionContainer, { TCProps } from "UI/TransitionContainer";

export type ChildrenFn = (isActive: boolean, isFrom: boolean, currentKey: number) => React.ReactNode;
export type TransitionProps = {
  activeKey: number;
  renderCount?: number;
  className?: string;
  children: React.ReactNode | ChildrenFn;
  name?: TCProps['name'];
};

const TRANSITION_DURATION = 250;

const Transition: React.FC<TransitionProps> = ({
  activeKey,
  renderCount,
  className,
  children,
  name = 'push'
}) => {

  const container = useRef();

  const rendersRef = useRef<Record<number, React.ReactNode | ChildrenFn>>({});
  const prevActiveKey = usePrevious<any>(activeKey);

  const activeKeyChanged = prevActiveKey !== undefined && activeKey !== prevActiveKey;

  if (!renderCount && activeKeyChanged) {
    rendersRef.current = { [prevActiveKey]: rendersRef.current[prevActiveKey] };
  }

  rendersRef.current[activeKey] = children;

  const renders = rendersRef.current;
  const renderKeys = Object.keys(renderCount ? new Array(renderCount).fill(undefined) : renders).map(Number);
  const contents = renderKeys.map((key) => {
    const render = renders[key];
    if (!render) return undefined;
    return (
      <TransitionContainer key={key}
        duration={TRANSITION_DURATION}
        isShown={key === activeKey}
        shouldTruncate={false}
        noOpenTransition={renderKeys.length <= 1}
        className={buildClassName("TransitionElement", "trans-" + key)}
        name={name}
      >
        {
          typeof render === 'function'
            ? render(key === activeKey, key === prevActiveKey, activeKey)
            : render
        }
      </TransitionContainer>
    );
  });

  return (
    <div className={buildClassName('TransitionWrap', className)}>
      {contents}
    </div>
  );
};

export default Transition;
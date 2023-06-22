import { memo, createElement } from "react";

import useShowTransition from "Hooks/useShowTransition";
import buildClassName from "Util/buildClassName";

import Main from "UI/Main";

const AppContainer = ({ isShown }) => {

	const {
		shouldRender,
		transitionClassNames,
	} = useShowTransition(
		isShown, undefined, true, undefined, false, {}, 350
	);

	return (
		<div className={buildClassName("app-container", transitionClassNames)}>
			{shouldRender && <Main />}
			<div className="uploadArea" />
		</div>
	);
};

export default memo(AppContainer);
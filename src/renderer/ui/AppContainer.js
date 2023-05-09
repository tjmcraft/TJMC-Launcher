// @ts-nocheck
import { memo, createElement, useEffect } from "react";

import useShowTransition from "Hooks/useShowTransition";
import buildClassName from "Util/buildClassName";

import Main from "UI/Main.js";
import { getDispatch, getState } from "Store/Global";
import { selectCurrentVersionHash } from "Model/Selectors/installations";


const AppContainer = ({ isShown }) => {

	const {
		openSettingsModal,
		invokeLaunch,
		openInstallationEditor,
		openVersionChooserModal,
	} = getDispatch();

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
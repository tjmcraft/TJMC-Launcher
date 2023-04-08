import { memo, createElement, useEffect } from "react";

import useShowTransition from "Hooks/useShowTransition";
import buildClassName from "Util/buildClassName";

import Main from "UI/Main.js";
import { getDispatch } from "Store/Global";


const AppContainer = ({ isShown }) => {

	const { openSettingsModal } = getDispatch();

	useEffect(() => {
		// @ts-ignore
		electron.on('open-settings', (e, data) => openSettingsModal()); // Send global event to open settings [electron]
	}, [openSettingsModal]);

	const {
		shouldRender,
		transitionClassNames,
	} = useShowTransition(
		isShown, undefined, true, undefined, false, { }, 350
	);

	return (
		<div className={buildClassName("app-container", transitionClassNames)}>
			{shouldRender && <Main />}
			<div className="uploadArea" />
		</div>
	);
};

export default memo(AppContainer);
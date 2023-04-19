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

	useEffect(() => {
		electron.on('open-settings', (e, data) => {
			openSettingsModal();
		});
		electron.on('installation.run.current', (e, data) => {
			const hash = getState(selectCurrentVersionHash);
			invokeLaunch({ hash: hash });
		});
		electron.on('installation.run.force', (e, data) => {
			const hash = getState(selectCurrentVersionHash);
			invokeLaunch({ hash: hash });
		});
		electron.on('installation.edit.current', (e, data) => {
			const hash = getState(selectCurrentVersionHash);
			openInstallationEditor({ hash: hash });
		});
		electron.on('installation.create.new', (e, data) => {
			openVersionChooserModal();
		});
	}, [
		openSettingsModal,
		invokeLaunch,
		openInstallationEditor,
		openVersionChooserModal
	]);

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
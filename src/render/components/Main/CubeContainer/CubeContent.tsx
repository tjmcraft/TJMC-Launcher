import { createElement, memo, useCallback, useEffect } from "react";

import buildClassName from "Util/buildClassName";
import useGlobal from "Hooks/useGlobal";
import { selectInstallation } from "Model/Selectors/installations";

import CubeTopContainer from "./CubeTopContainer";
import CubeMainContainer from "./CubeMainContainer";
import { addReducer, removeReducer } from "Store/Global";


const CubeContent = ({ hash }) => {

	const { hasInstallation } = useGlobal(global => {
		const version = selectInstallation(global, hash) || undefined;
		return {
			hasInstallation: version !== undefined,
		};
	}, [hash]);

	const runShortcutAction = useCallback((actions, { type, data }) => {
		const runCurrentInstallation = () => actions.invokeLaunch({ hash: hash });
		const stopCurrentInstallation = () => actions.revokeLaunch({ hash: hash });
		const runInstallationForce = () => actions.invokeLaunch({ hash: hash, params: { forceCheck: true } });
		const editInstallation = () => actions.openInstallationEditor({ hash: hash });
		const hostActions = {
			runCurrentInstallation,
			stopCurrentInstallation,
			runInstallationForce,
			editInstallation,
		};
		if (hostActions.hasOwnProperty(type))
			(hostActions[type])(data);
	}, [hash]);

	useEffect(() => {
		const handler = (global, actions, payload) => runShortcutAction(actions, payload);
		addReducer('runShortcutAction', handler);
		return () => removeReducer('runShortcutAction', handler);
	}, [runShortcutAction]);

	return (
		hasInstallation ? (
			<div className={buildClassName("main-content", "auto-s")}>
				<CubeTopContainer hash={hash} />
				<CubeMainContainer hash={hash} />
			</div>
		) : (
			<div className={buildClassName("main-content", "d-flex", "centred")}>
				<h1>{"Выберите версию"}</h1>
			</div>
		)
	);
};

export default memo(CubeContent);
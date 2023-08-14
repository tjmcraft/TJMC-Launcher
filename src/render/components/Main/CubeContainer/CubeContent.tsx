import { Fragment, createElement, memo, useCallback, useEffect } from "react";

import buildClassName from "Util/buildClassName";
import useGlobal from "Hooks/useGlobal";
import { addReducer, getDispatch, removeReducer } from "Store/Global";
import { selectInstallation } from "Model/Selectors/installations";

import CubeTopContainer from "./CubeTopContainer";
import CubeMainContainer from "./CubeMainContainer";


const CubeContent = ({ hash }) => {

	const { openCubeLogs, closeCubeLogs } = getDispatch();

	const { hasInstallation, hasModals, isCubeLogsOpen } = useGlobal(global => {
		const version = selectInstallation(global, hash) || undefined;
		return {
			hasInstallation: version !== undefined,
			hasModals: global.modals.length > 0,
			isCubeLogsOpen: global.isCubeLogsOpen,
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
		if (!hasInstallation || hasModals) return;
		const handler = (global, actions, payload) => runShortcutAction(actions, payload);
		addReducer('runShortcutAction', handler);
		return () => removeReducer('runShortcutAction', handler);
	}, [runShortcutAction, hasInstallation, hasModals]);

	return (
		hasInstallation ? (
			<Fragment>
				<div className="r-box" onDoubleClick={() => openCubeLogs()}>
					<div className={buildClassName("main-content", "auto-s")}>
						<CubeTopContainer hash={hash} />
						<CubeMainContainer hash={hash} />
					</div>
				</div>
				{isCubeLogsOpen && (
							<div className="r-box">
								<div className="header-w">
									<span>
										<i className="icon-bug"></i>
										<span>Логи</span>
									</span>
									<button className="circle" onClick={() => closeCubeLogs()}>
										<i className="icon-close"></i>
									</button>
								</div>
								<div className={buildClassName('scroller', 'thin-s', 'log')}>
									<span>log log</span>
									<span>log log</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
									<span>lof lof lof</span>
								</div>
							</div>
						)}
			</Fragment>
		) : (
			<div className={buildClassName("main-content", "d-flex", "centred", "r-box")}>
				<h1>{"Выберите версию"}</h1>
			</div>
		)
	);
};

export default memo(CubeContent);
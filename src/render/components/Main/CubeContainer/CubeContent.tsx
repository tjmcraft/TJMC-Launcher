import React, { FC, Fragment, RefObject, createElement, createRef, memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import buildClassName from "Util/buildClassName";
import useGlobal from "Hooks/useGlobal";
import { GlobalState, addReducer, getDispatch, removeReducer } from "Store/Global";
import { selectInstallation, selectInstance } from "Model/Selectors/installations";

import CubeTopContainer from "./CubeTopContainer";
import CubeMainContainer from "./CubeMainContainer";

const InstanceLog = memo<{ instanceId: string }>(function InstanceLog({ instanceId }: { instanceId: GlobalState['currentLogsHash'] }) {

	if (instanceId == undefined) return;

	const ref = useRef<HTMLDivElement>();
	const reachedTop = useRef<number>(1);
	const prevScroll = useRef<number>(0);

	const { closeCubeLogs } = getDispatch();
	const { instanceName, stderr, stdout } = useGlobal(global => {
		const instance = selectInstance(global, instanceId);
		const version = selectInstallation(global, instance.hash);
		return {
			instanceName: version.name,
			stdout: instance.stdout,
			stderr: instance.stderr,
		};
	}, [instanceId]);

	const handleInteract = useCallback((e) => {
		prevScroll.current = (ref.current.scrollHeight - ref.current.clientHeight) - ref.current.scrollTop;
	}, []);

	useLayoutEffect(() => {
		const { current } = ref;
		if (!current) return;
		const fst = current.scrollHeight - current.clientHeight <= 0;
		const unr = reachedTop.current != current.scrollTop;
		const usr = prevScroll.current <= 50;
		// console.log('noscr:', fst, 'unrc:', unr, 'usro:', usr);
		if (fst || unr && usr) {
			current.scrollBy({
				top: current.scrollHeight,
				behavior: 'smooth',
			});
			reachedTop.current = current.scrollHeight;
		}
	}, [stdout, stderr]);

	return (
		<div className="r-box">
			<div className="header-w">
				<span className="title">
					<i className="icon-bug"></i>
					<span>{instanceName || instanceId}</span>
				</span>
				<button className="circle" onClick={() => closeCubeLogs()}>
					<i className="icon-close"></i>
				</button>
			</div>
			<div className={buildClassName('scroller', 'thin-s', 'log')} ref={ref} onScroll={handleInteract}>
				<span>log log</span>
				{stdout.map((e, key) => (<span key={key}>{e}</span>))}
			</div>
		</div>
	);
});

const CubeContent = ({ hash }: { hash: string }) => {

	const { hasInstallation, hasModals, currentLogsHash } = useGlobal(global => {
		const version = selectInstallation(global, hash) || undefined;
		return {
			hasInstallation: version !== undefined,
			hasModals: global.modals.length > 0,
			currentLogsHash: global.currentLogsHash,
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
				<div className="r-box">
					<div className={buildClassName("main-content", "auto-s")}>
						<CubeTopContainer hash={hash} />
						<CubeMainContainer hash={hash} />
					</div>
				</div>
				{currentLogsHash != undefined && (
					<InstanceLog instanceId={currentLogsHash} />
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
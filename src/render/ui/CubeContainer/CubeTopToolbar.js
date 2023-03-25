import { createElement, useCallback, memo } from "react";

import { getDispatch } from "Store/Global";
import useGlobal from "Hooks/useGlobal";
import useGlobalProgress from "Hooks/useGlobalProgress";
import useHostOnline from "Hooks/useHostOnline";
import { selectInstallation } from "Model/Selectors/installations";

import Button from "UI/components/Button";


const CubeTopToolbar = ({ hash }) => {

	const { invokeLaunch, revokeLaunch } = getDispatch();

	const hostOnline = useHostOnline();
	const { name, type, isLoading } = useGlobal(global => {
		const version = selectInstallation(global, hash);
		return {
			name: version.name,
			type: version.type,
			isLoading: version.isProcessing,
		};
	}, [hash]);

	const { progress } = useGlobalProgress(global => {
		const version = global[hash] || {};
		return {
			progress: version.progress || 0,
		};
	}, [hash]);

	const handlePlayClick = useCallback(() => (!isLoading ?
		invokeLaunch({ hash }) : revokeLaunch({ hash })
	), [hash, isLoading, invokeLaunch, revokeLaunch]);

	return hash && (
		// @ts-ignore
		<div className="top-toolbar" style={{ '--progress': `${progress * 100}%` }}>
			<div className="title">
				<h2>{name || hash}</h2>
				<h5>{type}</h5>
			</div>
			<Button
				id='playButton'
				onClick={handlePlayClick}
				isLoading={isLoading}
				isFilled={true}
				isPrimary={!isLoading}
				isRed={isLoading}
				disabled={!hostOnline}
			>{isLoading ? 'Остановить' : 'Играть'}</Button>
		</div>
	);
};

export default memo(CubeTopToolbar);
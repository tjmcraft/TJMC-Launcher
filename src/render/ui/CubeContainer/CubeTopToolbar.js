import { createElement, useCallback, memo, useMemo } from "react";

import { getDispatch } from "Store/Global";
import useGlobal from "Hooks/useGlobal";
import useGlobalProgress from "Hooks/useGlobalProgress";
import useHostOnline from "Hooks/useHostOnline";
import { selectInstallation } from "Model/Selectors/installations";

import Button from "UI/components/Button";


const CubeTopToolbar = ({ hash }) => {

	const { invokeLaunch, revokeLaunch } = getDispatch();

	const hostOnline = useHostOnline();

	const { progress, progressType } = useGlobalProgress(global => {
		const version = global[hash] || {};
		return {
			progress: version.progress || 0,
			progressType: version.progressType || undefined,
		};
	}, [hash]);

	const { name, type, isLoading } = useGlobal(global => {
		const version = selectInstallation(global, hash);
		return {
			name: version.name,
			type: version.type,
			isLoading: version.isProcessing || progressType == 'aborting',
		};
	}, [hash, progressType]);

	const handlePlayClick = useCallback(() => (!isLoading ?
		invokeLaunch({ hash }) : revokeLaunch({ hash })
	), [hash, isLoading, invokeLaunch, revokeLaunch]);

	const subtitle = useMemo(() => {
		if (isLoading && progressType != void 0) {
			return `${Object.seal({
				natives: 'loading natives',
				indexes: 'loading asset manifest',
				assets: 'loading assets',
				classes: 'loading libraries',
				'classes-maven': 'loading maven libraries',
				'version-jar': 'loading main jar',
				aborting: 'aborting',
				terminated: 'terminated',
			})[progressType] || "loading"}...`;
		}
		return type;
	}, [type, progressType, isLoading]);

	return hash && (
		// @ts-ignore
		<div className="top-toolbar" style={{ '--progress': `${progress * 100}%` }}>
			<div className="title">
				<h2>{name || hash}</h2>
				<h5>{subtitle}</h5>
			</div>
			<Button
				id='playButton'
				onClick={handlePlayClick}
				isLoading={isLoading}
				isFilled={true}
				isPrimary={!isLoading}
				isRed={isLoading}
				disabled={!hostOnline || progressType == 'aborting'}
			>{isLoading ? 'Остановить' : 'Играть'}</Button>
		</div>
	);
};

export default memo(CubeTopToolbar);
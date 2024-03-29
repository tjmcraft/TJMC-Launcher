import React, { createElement, useCallback, memo, useMemo, useEffect, useState } from "react";

import { getDispatch } from "Store/Global";
import useGlobal from "Hooks/useGlobal";
import useGlobalProgress from "Hooks/useGlobalProgress";
import useHostOnline from "Hooks/useHostOnline";
import useReservedKey from "Hooks/useReservedKey";
import { selectInstallation } from "Model/Selectors/installations";

import Button from "UI/Button";
import { toFixedNumber } from "Util/Numbers";


const CubeTopToolbar = ({ hash }: { hash: string }) => {

	const { invokeLaunch, revokeLaunch } = getDispatch();

	const hostOnline = useHostOnline();

	const { progress, progressType, time } = useGlobalProgress(global => {
		const version = global[hash] || {};
		return {
			progress: version.progress * 100 || 0,
			progressType: version.progressType || undefined,
			time: version.time || 0,
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

	const altPressed = useReservedKey('mod');

	const handlePlayClick = useCallback((e) => {
		console.debug(e);
		if (!isLoading) {
			if (e.ctrlKey || e.metaKey) {
				invokeLaunch({ hash, params: { forceCheck: true } });
			} else invokeLaunch({ hash });
		} else revokeLaunch({ hash });
	}, [hash, isLoading, invokeLaunch, revokeLaunch]);

	const subtitle = useMemo(() => {
		if (isLoading && progressType != void 0) {
			return `${Object.seal({
				'load:version-manifest': 'loading version manifest',
				'load:java': 'loading java',
				natives: 'loading natives',
				indexes: 'loading asset manifest',
				'args:progress': 'loading resources',
				download: 'downloading resources',
				aborting: 'aborting',
				terminated: 'terminated',
			})[progressType] || "loading"}\xa0-\xa0${toFixedNumber(progress, 0)}%\xa0${time ? `-\xa0${Math.floor(time / 60) > 0 ? `${Math.floor(time / 60)}m\xa0` : ''}${Math.round(time % 60)}s` : ''}`;
		}
		return type;
	}, [type, progressType, isLoading, progress, time]);

	return hash && (
		// @ts-ignore
		<div className="top-toolbar" style={{ '--progress': `${progress}%` }}>
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
				disabled={!hostOnline || progressType == 'aborting'}
			>{isLoading ? (progressType ? 'Остановить' : 'Отменить') : altPressed ? 'Обновить' : 'Играть'}</Button>
		</div>
	);
};

export default memo(CubeTopToolbar);
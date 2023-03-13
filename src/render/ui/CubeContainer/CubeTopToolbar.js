import { createElement, useCallback, memo } from "react";

import { getDispatch } from "Util/Store";
import useGlobal from "Hooks/useGlobal";
import useHostOnline from "Hooks/useHostOnline";
import { selectInstallation } from "Model/Selectors/installations";

import Button from "UI/components/Button";


const CubeTopToolbar = ({ hash }) => {

	const { invokeLaunch } = getDispatch();

	const hostOnline = useHostOnline();
	const { name, type, isLoading } = useGlobal(global => {
		const version = selectInstallation(global, hash);
		return {
			name: version.name,
			type: version.type,
			isLoading: version.isProcessing,
		};
	}, [hash]);

	const handlePlayClick = useCallback(() => {
		invokeLaunch({ hash }); // Start minecraft with given version hash and auth param
	}, [hash, invokeLaunch]);

	return hash && (
		<div className="top-toolbar">
			<div className="title">
				<h2>{name || hash}</h2>
				<h5>{type}</h5>
			</div>
			<Button
				id='playButton'
				onClick={handlePlayClick}
				isLoading={isLoading}
				disabled={!hostOnline || isLoading}
			>Играть</Button>
		</div>
	);
};

export default memo(CubeTopToolbar);
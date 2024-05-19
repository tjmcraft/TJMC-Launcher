import React, { memo, createElement, useEffect } from "react";
import useGlobal from "Hooks/useGlobal";
import { selectInstallation, selectScreenshots } from "Model/Selectors/installations";
import { getDispatch } from "Store/Global";
import useHostOnline from "Hooks/useHostOnline";

const ScreenshotsCard = ({ hash }: { hash: string }) => {
	const hostOnline = useHostOnline();
	const { fetchInstallationScreenshots } = getDispatch();

	const { name } = useGlobal(global => selectInstallation(global, hash), [hash]);
	useEffect(() => hostOnline && name ? fetchInstallationScreenshots(name) : null, [hostOnline, name]);
	const screenshots = useGlobal(global => selectScreenshots(global, name));

	return (
		<div>
			<h1>screenshots</h1>
			{screenshots.length > 0 ? (
				screenshots.map((src, key) => (
					<img src={src} key={src} width={150}/>
				))
			) : null}
		</div>
	);
};

const Test = ({ hash }: { hash: string }) => {
	const { name } = useGlobal(global => {
		const version = selectInstallation(global, hash);
		return { name: version.name };
	}, [hash]);
	return (
		<div>
			<span>
				<h1>{name} - {hash}</h1>
			</span>
		</div>
	);
};

const CubeMainContainer = ({ hash }: { hash: string }) => {
	// if (APP_ENV == "production") return null;
	return (
		<div className="main">
			<Test hash={hash} />
			<ScreenshotsCard hash={hash} />
		</div>
	);
};

export default memo(CubeMainContainer);
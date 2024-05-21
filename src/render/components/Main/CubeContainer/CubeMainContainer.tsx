import React, { memo, createElement, useEffect } from "react";
import useGlobal from "Hooks/useGlobal";
import { selectInstallation, selectScreenshots } from "Model/Selectors/installations";
import { getDispatch } from "Store/Global";
import useHostOnline from "Hooks/useHostOnline";
import buildClassName from "Util/buildClassName";

const ScreenshotsCard = ({ hash }: { hash: string }) => {
	const hostOnline = useHostOnline();
	const { fetchInstallationScreenshots } = getDispatch();

	const { name } = useGlobal(global => selectInstallation(global, hash), [hash]);
	useEffect(() => hostOnline && name ? fetchInstallationScreenshots(name) : null, [hostOnline, name]);
	const screenshots = useGlobal(global => selectScreenshots(global, name));

	return (
		<div className={buildClassName("r-box", "main")} style={{width: "500px", height: "50vh"}}>
			<div className="header-w-wrap">
			<div className='header-w'>
				<span className="title">
					<i className="icon-forums"></i>
					<span>Screenshots</span>
				</span>
			</div>

			</div>
			<div className={buildClassName('scroller', 'thin-s')} style={{ padding: 0 }}>
				{screenshots.length > 0 ? (
					screenshots.map((src, key) => (
						<div className={buildClassName("item", "navItem")} key={src}>
							<img src={src} key={src} width={150} />
							<span>{src}</span>
						</div>
					))
				) : null}
			</div>
		</div>
	);
};

const Test = ({ hash }: { hash: string }) => {
	const { name } = useGlobal(global => {
		const version = selectInstallation(global, hash);
		return { name: version.name };
	}, [hash]);
	return (
		<div className="r-box">
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
			<div className="main-row">
			<ScreenshotsCard hash={hash} />

			<ScreenshotsCard hash={hash} />
			</div>
		</div>
	);
};

export default memo(CubeMainContainer);
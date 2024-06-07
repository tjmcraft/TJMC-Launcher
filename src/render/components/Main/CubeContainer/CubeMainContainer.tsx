import React, { memo, createElement, useEffect, useCallback } from "react";
import useGlobal from "Hooks/useGlobal";
import { selectInstallation, selectSaves, selectScreenshots } from "Model/Selectors/installations";
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
					<button className="circle">
						<i className="icon-folder"></i>
					</button>
				</div>
			</div>
			<div className={buildClassName('scroller', 'thin-s')} style={{ padding: 0 }}>
				{screenshots.length > 0 ? (
					screenshots.map((screenshot: HostInstallationScreenshot, key) => (
						<div className={buildClassName("item", "navItem")} key={screenshot.path as string}>
							<img src={screenshot.path as string} key={screenshot.path as string} height={64} />
							<span>{screenshot.name}</span>
						</div>
					))
				) : null}
			</div>
		</div>
	);
};

const SavesCard = ({ hash }: { hash: string }) => {
	const hostOnline = useHostOnline();
	const { fetchInstallationSaves, openInstallationSavesFolder, openInstallationSaveFolder, removeInstallationSave, alert } = getDispatch();

	const { name } = useGlobal(global => selectInstallation(global, hash), [hash]);
	useEffect(() => hostOnline && name ? fetchInstallationSaves(name) : null, [hostOnline, name]);
	const saves = useGlobal(global => selectSaves(global, name));
	const openSavesFolder = useCallback(() => openInstallationSavesFolder(name), [name]);
	const openSaveFolder = useCallback((saveName) => openInstallationSaveFolder({ hash: name, name: saveName }), [name]);

	const handleRemoveClick = useCallback((saveName) => {
		alert({
			title: "Удаление installation save",
			content: `Вы действительно хотите удалить "${saveName}" с вашего компьютера?`,
			type: "error",
			buttons: [
				{
					name: "Отмена",
					closeOverlay: true,
				},
				{
					name: "Удалить",
					class: ["filled", "colorRed"],
					closeOverlay: true,
					callback: () => {
						removeInstallationSave({ hash: name, name: saveName });
					}
				},
			],
			mini: true,
		});
	}, [alert, name, removeInstallationSave, hash]);

	return (
		<div className={buildClassName("r-box", "main")} style={{width: "500px", height: "50vh"}}>
			<div className="header-w-wrap">
				<div className='header-w'>
					<span className="title">
						<i className="icon-forums"></i>
						<span>Saves</span>
					</span>
					<button className="circle" onClick={openSavesFolder} title="Open saves folder">
						<i className="icon-folder"></i>
					</button>
				</div>
			</div>
			<div className={buildClassName('scroller', 'thin-s')} style={{ padding: 0 }}>
				{saves.length > 0 ? (
					saves.map((save: HostInstallationSave, key) => (
						<div className={buildClassName("item", "navItem")} key={save.path as string}>
							<div className="avatar">
								<img src={save.iconPath as string} key={save.path as string} height={64} />
							</div>
							<div className="nameTag">
								<div className="title">{save.name as string}</div>
								<div className="subtitle">{new Date(save.meta.lastPlayed).toLocaleString()}</div>
								<div className="subtitle">{"Minecraft "+save.meta.gameVersion}</div>
							</div>
							<div className="actions">
								<button className="circle" onClick={() => openSaveFolder(save.name)} title="Open save folder">
									<i className="icon-folder"></i>
								</button>
								<button className={buildClassName("circle", "destructive")} onClick={() => handleRemoveClick(save.name)} title="Delete save">
									<i className="icon-delete"></i>
								</button>
							</div>
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
				<SavesCard hash={hash} />
				<ScreenshotsCard hash={hash} />
			</div>
		</div>
	);
};

export default memo(CubeMainContainer);
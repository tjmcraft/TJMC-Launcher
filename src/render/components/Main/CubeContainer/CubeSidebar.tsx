import { memo, createElement, Fragment, useCallback, useState, useRef } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Store/Global";
import useGlobal from "Hooks/useGlobal";
import { selectCurrentVersionHash, selectInstallations, selectInstances } from "Model/Selectors/installations";

import CubeSidebarItem from "./CubeSidebarItem";
import InstanceItem from "./InstanceItem";
import Tooltip from "UI/Tooltip";


const CubeSidebarItems = memo(() => {
	const { moveInstallationPosition } = getDispatch();

	const installations = useGlobal(global => Object.keys(selectInstallations(global)));
	const { hash: currentHash } = useGlobal(global => ({ hash: selectCurrentVersionHash(global) }));

	const [dragOverItem, setDragOverItem] = useState(undefined);

	const handleDragStart = useCallback((e, hash) => e.dataTransfer.setData("installation-hash", hash), []);
	const handleDragEnd = useCallback((e) => {
		const endHash = e.target.getAttribute('version-hash');
		const startHash = e.dataTransfer.getData("installation-hash");
		e.dataTransfer.clearData();
		window.__debug__ && console.debug("[drag]", startHash, ">>", endHash);
		moveInstallationPosition({ startHash: startHash, endHash: endHash });
	}, [moveInstallationPosition]);

	return installations.length ? (
		<div
			className="installations"
			onDragLeave={() => setDragOverItem(undefined)}
			onDragEnd={() => setDragOverItem(undefined)}
			onDragOver={e => e.preventDefault()}
			onDrop={handleDragEnd}
		>
			{installations.map((hash) => (
				<CubeSidebarItem
					key={hash}
					hash={hash}
					isSelected={currentHash == hash}
					isDragOver={dragOverItem == hash}
					onDragStart={(e) => handleDragStart(e, hash)}
					onDragOver={() => setDragOverItem(hash)}
				/>
			))}
		</div>
	) : (
		<div className={buildClassName('item', "d-flex", "centred", 'fp')}>
			<h1>{'Добавьте версию'}</h1>
		</div>
	);
});

export const InstallationsScroller = memo(() => {
	const { openVersionChooserModal } = getDispatch();
	const onClick = () => openVersionChooserModal();
	const addVersionButton = useRef();
	return (
		<div className={buildClassName("r-box", "installations")}>
			<div className="header-w">
				<span>
					<i className="icon-forums"></i>
					<span>Мои установки</span>
				</span>
				<button className="circle" onClick={onClick} ref={addVersionButton}>
					<i className="icon-add"></i>
				</button>
				<Tooltip forRef={addVersionButton}>Добавить версию</Tooltip>
			</div>
			<div className={buildClassName('scroller', 'thin-s')}>
				<CubeSidebarItems />
			</div>
		</div>
	);
});

export const InstanceScroller = memo(() => {
	const { killAllInstances, alert } = getDispatch();
	const instances = useGlobal(global => Object.keys(selectInstances(global)));
	const handleKillAll = useCallback(() => {
		alert({
			title: "Остановить всё",
			content: `Вы действительно хотите остановить все запущенные версии?`,
			type: "error",
			buttons: [
				{
					name: "Отмена",
					closeOverlay: true,
				},
				{
					name: "Остановить",
					class: ["filled", "colorRed"],
					closeOverlay: true,
					callback: () => {
						killAllInstances();
					}
				}
			],
			mini: true,
		});
	}, [killAllInstances, alert]);
	return instances.length > 0 && (
		<div className={buildClassName("r-box", "instances")}>
		<div className={buildClassName('scroller', 'thin-s')}>
			<h2 className='header-w'>
					<span>
					<i className="icon-play"></i>
					<span>Сейчас запущено</span>
					</span>
					<button className="circle" onClick={handleKillAll} title="Kill all instances">
						<i className="icon-close"></i>
					</button>
			</h2>
			{instances.map((instanceId) =>
				<InstanceItem
					key={instanceId}
					instanceId={instanceId}
				/>)}
			</div>
		</div>
	);
});
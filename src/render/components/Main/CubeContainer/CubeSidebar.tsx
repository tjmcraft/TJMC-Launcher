import { memo, createElement, Fragment, useCallback, useState, useRef, useEffect } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Store/Global";
import useGlobal from "Hooks/useGlobal";
import { selectCurrentVersionHash, selectInstallations, selectInstances } from "Model/Selectors/installations";

import CubeSidebarItem from "./CubeSidebarItem";
import InstanceItem from "./InstanceItem";
import Tooltip from "UI/Tooltip";
import { TextInput } from "UI/Input";
import captureEscKeyListener from "Util/captureEscKeyListener";
import { searchInObject } from "Util/Iterates";


const CubeSidebarItems = memo(({ installations }: { installations: Array<string> }) => {

	const { moveInstallationPosition } = getDispatch();
	const currentHash = useGlobal(global => selectCurrentVersionHash(global));

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
	const addVersionButton = useRef();

	const installations = useGlobal(global => selectInstallations(global));

	const [searchParam, setSearchParam] = useState("");

	const handleInput = useCallback((e) => {
		e.stopPropagation();
		setSearchParam(e.target.value);
	}, []);
	const handleClear = useCallback(() => setSearchParam(null), []);
	useEffect(() => searchParam && captureEscKeyListener(() => handleClear()), [searchParam, handleClear]);

	return (
		<div className={buildClassName("r-box", "installations")}>
			<div className="header-w">
				<span>
					<i className="icon-forums"></i>
					<span>Мои установки</span>
				</span>
				<button className="circle" onClick={openVersionChooserModal} ref={addVersionButton}>
					<i className="icon-add"></i>
				</button>
				<Tooltip forRef={addVersionButton}>Добавить версию</Tooltip>
			</div>
			<div>
				<TextInput id="installations-search"
					onChange={handleInput}
					onClear={handleClear}
					value={searchParam}
					autoFocus={false}
					placeholder="Введите название версии"
					small
				/>
			</div>
			<div className={buildClassName('scroller', 'thin-s')}>
				<CubeSidebarItems installations={Object.keys(searchInObject(installations, searchParam, e => e.name))} />
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
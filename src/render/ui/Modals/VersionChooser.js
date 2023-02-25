
import { createElement, memo, useEffect, useMemo, useState, useRef, useCallback } from "react";

import buildClassName from "Util/buildClassName.js";
import { getDispatch } from "Util/Store.js";
import { cleanObject } from "Util/Iterates";
import captureEscKeyListener from "Util/captureEscKeyListener";
import useGlobal from "Hooks/useGlobal";
import useHostOnline from "Hooks/useHostOnline";
import useVirtualBackdrop from "Hooks/useVirtualBackdrop";
import { selectVersions } from "Model/Selectors/installations.js";

import { Modal, ModalFooter } from "UI/Modals";
import { InputGroup, PathInput } from "UI/components/Input.js";
import Select from "UI/components/Select";
import MenuItem from "UI/components/MenuItem";

import "./VersionChooser.css";


const Sidebar = ({ type = undefined, onSelect = void 0, selected = undefined }) => {

	const versions = useGlobal(global => selectVersions(global, type), [type]);

	const handleSelect = (item) => {
		return e => {
			e.stopPropagation();
			if (typeof onSelect === 'function') onSelect(item);
		};
	};

	return (
		<div className="sidebar-region">
			<div className="sidebar">
				{versions.length <= 0 && (
					[...Array(12)].map((v, k) =>
						<div key={k}
							className={buildClassName('item', 'navItem', 'bgL')} />)
				)}
				{versions.length > 0 && (
					versions.map((item, i) =>
						<div key={i}
							className={buildClassName('item', 'navItem', selected?.id == item.id && 'selected')}
							onClick={handleSelect(item)}
						>{item.id}</div>)
				)}
			</div>
		</div>
	);
};

const DropdownSelector = ({ title = "Версии", items = [], onSelect = void 0 }) => {

	const [isOpen, setOpen] = useState(false);
	const [selected, select] = useState(undefined);
	const menuRef = useRef();

	const handleClick = (e) => {
		e.preventDefault();
		setOpen((state) => !state);
	};

	const onClose = useCallback(() => {
		setOpen(false);
	}, [setOpen]);

	const handleSelect = (item) => {
		return (e) => {
			e.stopPropagation();
			select(item);
			setOpen(false);
			if (typeof onSelect === 'function') onSelect(item);
		};
	};

	useEffect(() => (isOpen ? captureEscKeyListener(onClose) : undefined), [isOpen, onClose]);
	useVirtualBackdrop(isOpen, menuRef, onClose);

	return (
		<div className="container-f" onClick={handleClick} ref={menuRef}>
			<div className="header">
				<h1>{selected ? selected.name : title}</h1>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" className={buildClassName("button-1w5pas", isOpen && "open")}>
					<g fill="none" fill-rule="evenodd">
						<path d="M0 0h18v18H0" />
						<path stroke="currentColor" d="M4.5 4.5l9 9" stroke-linecap="round" />
						<path stroke="currentColor" d="M13.5 4.5l-9 9" stroke-linecap="round" />
					</g>
				</svg>
			</div>
			<div className={buildClassName('dropdown', !isOpen && "hidden")}>
				{items && items.map(item => createElement('a', { onClick: handleSelect(item) }, item.name))}
			</div>
		</div>
	);
};

const JavaSelector = ({ items, onChange, selectedIndex, title }) => {

	const handleClick = (i) => {
		return (e) => {
			if (onChange) onChange(i);
		};
	};

	const current = items[selectedIndex];

	return (
		<Select title={title} value={`${current.name}`}>
			{items.map((e, i) => (
				<MenuItem compact
					key={i}
					selected={selectedIndex == i}
					onClick={handleClick(i)}
				>{e.name} - {e.path}</MenuItem>
			))}
		</Select>
	);
};

const VersionChooserContent = ({ version, onCancel, onBack, isLeftOpen }) => {

	const { createInstallation } = getDispatch();
	const config = useGlobal(global => global.configuration);
	const hostOnline = useHostOnline();

	const [index, setIndex] = useState(1);
	const [name, setName] = useState("");
	const [gameDir, setGameDir] = useState(undefined);
	const [width, setWidth] = useState(undefined);
	const [height, setHeight] = useState(undefined);
	const [javaPath, setJavaPath] = useState(undefined);
	const [javaArgs, setJavaArgs] = useState(undefined);

	const version_opts_default = useMemo(() => Object.seal({
		name: version.id ? `Версия ${version.id}` : 'Версия без имени',
		type: version.type,
		resolution: {},
		gameDir: undefined,
		javaPath: undefined,
		javaArgs: undefined,
	}), [version]);

	if (!version) return null;

	const handleSubmit = () => {
		let data = cleanObject(Object.assign(version_opts_default, {
			name: name || version_opts_default.name,
			type: version.type,
			resolution: {
				width: width || undefined,
				height: height || undefined,
			},
			gameDir: gameDir || undefined,
			javaPath: javaPath || undefined,
			javaArgs: javaArgs || undefined,
		}));
		console.debug(">> createVersion", version.id, data);
		hostOnline && createInstallation({ version: version.id, options: data });
	};

	const fakeJavas = [
		{
			name: "Java 1",
			path: "/lib/java/1",
		},
		{
			name: "Java 2",
			path: "/lib/java/2",
		},
		{
			name: "Java 3",
			path: "/lib/java/3",
		},
		{
			name: "Java 4",
			path: "/lib/java/4",
		},
		{
			name: "Java 5",
			path: "/lib/java/5",
		},
	];

	return (
		<div className="main-content">
			<div className="middleHeader">
				<div className="backButton">
					<button onClick={onBack}>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 18 18" className={buildClassName("button-4fai7c", isLeftOpen && "open")}>
							<g fill="none" fill-rule="evenodd">
								<path d="M0 0h18v18H0" />
								<path stroke="currentColor" d="M4.5 4.5l9 9" stroke-linecap="round" />
								<path stroke="currentColor" d="M13.5 4.5l-9 9" stroke-linecap="round" />
							</g>
						</svg>
					</button>
				</div>
				<h2>{version.id ? `Создание установки версии ${version.id}` : 'Создание установки'}</h2>
			</div>
			<div className={buildClassName("VT-flex-box", "thin-s")}>
				<div className="children-zx1">
					<InputGroup title="Название установки" htmlFor="installation.name.input">
						<input
							id="installation.name.input"
							type="text"
							name="installation-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={version_opts_default.name} />
					</InputGroup>
				</div>
				<div className="children-zx1">
					<PathInput
						placeholder="<папка по умолчанию>"
						title="Папка игры"
						onChange={setGameDir}
						value={gameDir}
					/>
				</div>
				<div className="children-zx1">
					<InputGroup title="Разрешение" htmlFor="installation.resolution.wrap">
						<div className="resolution" id="installation.resolution.wrap">
							<input
								type="number"
								name="installation-resolution-width"
								value={width}
								onChange={(e) => setWidth(e.target.value)}
								placeholder={config?.minecraft?.launch?.width || "<auto>"} />
							<span className="resolutionCross">✖</span>
							<input
								type="number"
								name="installation-resolution-height"
								value={height}
								onChange={(e) => setHeight(e.target.value)}
								placeholder={config?.minecraft?.launch?.height || "<auto>"} />
						</div>
					</InputGroup>
				</div>
				<div className="children-zx1" style={{display: "none"}}>
					<JavaSelector
						title="Путь к java"
						items={fakeJavas}
						selectedIndex={index}
						onChange={(e) => {
							console.debug("jvs >>", e);
							setIndex(e);
						}}
					/>
				</div>
				<div className="children-zx1">
					<PathInput
						type="file"
						title="Путь к Java"
						placeholder="<java по умолчанию>"
						onChange={setJavaPath}
						value={javaPath}
					/>
				</div>
				<div className="children-zx1">
					<InputGroup title="Аргументы Java" htmlFor="installation.java.args.input">
						<input id="installation.java.args.input"
							type="text"
							name="installation-java-args"
							value={javaArgs}
							onChange={(e) => setJavaArgs(e.target.value)}
							placeholder="Java Arguments" />
					</InputGroup>
				</div>
			</div>
			<ModalFooter>
				<button className={buildClassName("grow")} onClick={onCancel}>{"Отмена"}</button>
				<button className={buildClassName("grow", "filled", "colorBrand")} disabled={!hostOnline} onClick={handleSubmit}>{"Создать"}</button>
			</ModalFooter>
		</div>
	);
};

const VersionChooser = (props) => {

	const { getGlobalVersions } = getDispatch();

	const [selectedType, selectType] = useState(undefined);
	const [selectedVersion, selectVersion] = useState(undefined);
	const versionTypes = useMemo(() => ([
		{ name: 'Release', type: 'release' },
		{ name: 'Modified', type: 'modified' },
		{ name: 'Snapshot', type: 'snapshot' },
		{ name: 'Pending', type: 'pending' },
		{ name: 'Beta', type: 'old_beta' },
		{ name: 'Alpha', type: 'old_alpha' },
	]), []);

	const [leftOpen, setLeftOpen] = useState(true);

	const handleTypeSelect = useCallback((item) => {
		selectType(item.type);
	}, [selectType]);
	const handleVersionSelect = useCallback((item) => {
		selectVersion(item);
	}, [selectVersion]);
	const handleCancel = useCallback(() => {
		selectVersion(undefined);
	}, [selectVersion]);
	const handleBack = useCallback(() => {
		setLeftOpen(state => !state);
	}, [setLeftOpen]);

	const { full_chooser: shouldFull } = useGlobal(global => global.settings);

	useEffect(() => getGlobalVersions(), [getGlobalVersions]);
	useEffect(() => (selectedVersion ? captureEscKeyListener(handleCancel) : undefined), [selectedVersion, handleCancel]);
	useEffect(() => {
		setTimeout(() => setLeftOpen(!selectedVersion), selectedVersion ? 200 : 100);
	}, [selectedVersion]);

	return (
		<Modal mini={props.mini} small={props.small} full={shouldFull}>
			<div className={buildClassName("container", !leftOpen && "left-closed")} id="version-selector">
				<div className="leftColumn">
					<DropdownSelector items={versionTypes} onSelect={handleTypeSelect} />
					<Sidebar type={selectedType} onSelect={handleVersionSelect} selected={selectedVersion} />
				</div>
				<div className="middleColumn">
					{selectedVersion ? (
						<VersionChooserContent version={selectedVersion} onCancel={handleCancel} onBack={handleBack} isLeftOpen={leftOpen} />
					) : (
						<div className={buildClassName("main-content", "d-flex", "centred")}>
							<h1>{"Выберите версию"}</h1>
							<h3>{"для установки"}</h3>
						</div>
					)}
				</div>
			</div>
		</Modal>
	);
};

export default memo(VersionChooser);
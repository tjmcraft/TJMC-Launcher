import { createElement, memo, useEffect, useMemo, useState, useRef, useCallback, Fragment } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Store/Global";
import { cleanObject } from "Util/Iterates";
import captureEscKeyListener from "Util/captureEscKeyListener";
import useGlobal from "Hooks/useGlobal";
import useHostOnline from "Hooks/useHostOnline";
import useVirtualBackdrop from "Hooks/useVirtualBackdrop";
import { selectVersions } from "Model/Selectors/installations.js";

import { Modal, ModalFooter } from "UI/Modal";
import { InputGroup, InputText, PathInput } from "UI/Input";
import Select from "UI/Select";
import MenuItem from "UI/MenuItem";
import SettingSwitch from "UI/SettingSwitch";

import "./VersionChooser.css";

const Sidebar = ({ type = undefined, onSelect = void 0, selected = undefined }) => {

	const versions = useGlobal(global => selectVersions(global, type), [type]);

	const handleSelect = useCallback((item) => {
		return e => {
			e.stopPropagation();
			if (typeof onSelect === 'function') onSelect(item);
		};
	}, [onSelect]);

	const [searchParam, setSearchParam] = useState("");
	const search = (item) => !searchParam || item.id.toString().toLowerCase().indexOf(searchParam.toLowerCase()) > -1;
	const sort = (a, b) => {
		if (searchParam) {
			if (a.id.toLowerCase().indexOf(searchParam.toLowerCase()) > b.id.toLowerCase().indexOf(searchParam.toLowerCase())) {
				return 1;
			} else if (a.id.toLowerCase().indexOf(searchParam.toLowerCase()) < b.id.toLowerCase().indexOf(searchParam.toLowerCase())) {
				return -1;
			}
		}
		return 0;
	};
	const handleInput = useCallback((e) => {
		e.stopPropagation();
		const value = e.target.value;
		console.debug(">>", value);
		setSearchParam(value);
	}, []);
	const handleClear = useCallback(() => {
		setSearchParam(null);
	}, []);
	useEffect(() => searchParam && captureEscKeyListener(() => handleClear()), [searchParam, handleClear]);

	return (
		<Fragment>
			<div className="sidebar-region">
				<div className="sidebar">
					{versions.length <= 0 && (
						[...Array(12)].map((_v, k) =>
							<div key={k}
								className={buildClassName('item', 'navItem', 'bgL')} />)
					)}
					{versions.length > 0 && (
						versions.filter(search).sort(sort).map((item, i) =>
							<div key={i}
								className={buildClassName('item', 'navItem', selected?.id == item.id && 'selected')}
								onClick={handleSelect(item)}
							>{item.id}</div>)
					)}
				</div>
			</div>
			<div className="sidebar-bottom">
				<InputText id="versions-search"
					autoFocus={true}
					placeholder="Введите название версии"
					onChange={handleInput}
					onClear={handleClear}
					value={searchParam}
					small />
			</div>
		</Fragment>
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
				{items && items.map(item => createElement('span', { onClick: handleSelect(item) }, item.name))}
			</div>
		</div>
	);
};

const JavaSelector = ({ items, onChange, selectedIndex, title }) => {

	const handleClick = (i) => {
		return () => {
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

	const { createInstallation, closeModal } = getDispatch();
	const config = useGlobal(global => global.configuration);
	const hostOnline = useHostOnline();

	const [index, setIndex] = useState(1);
	const [name, setName] = useState("");
	const [gameDir, setGameDir] = useState(undefined);
	const [width, setWidth] = useState(undefined);
	const [height, setHeight] = useState(undefined);
	const [javaPath, setJavaPath] = useState(undefined);
	const [javaArgs, setJavaArgs] = useState(undefined);
	const [forceOverrides, setForceOverrides] = useState(false);
	const [checkHash, setCheckHash] = useState(undefined);
	const [checkFiles, setCheckFiles] = useState(undefined);

	const version_opts_default = useMemo(() => Object.seal({
		name: version.id ? `Версия ${version.id}` : 'Версия без имени',
		type: version.type,
		resolution: {},
		gameDir: undefined,
		javaPath: undefined,
		javaArgs: undefined,
		checkHash: undefined,
		checkFiles: undefined,
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
			...(forceOverrides ? {
				checkHash: checkHash || undefined,
				checkFiles: checkFiles || undefined,
			} : {})
		}));
		console.debug(">> createVersion", version.id, data);
		if (hostOnline) {
			createInstallation({ version: version.id, options: data });
			closeModal();
		}
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
		<div className={buildClassName("main-content", "d-flex")}>
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
				<div className="children-zx1" style={{ display: "none" }}>
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
				<div className="separator children-zx1" />
				<div className="children-zx1">
					<SettingSwitch id={"installation.overrides.enable"}
						checked={forceOverrides}
						action={(s) => setForceOverrides(s)}
						title={"Использовать переопределения"}
						note={"Переопределения позволяют вам принудительно использовать дополнительные опции в обход глобальных настроек."}
					/>
				</div>
				<div className="separator children-zx1" />
				<div className="children-zx1">
					<SettingSwitch id={"installation.overrides.checkHash"}
						disabled={!forceOverrides || !checkFiles}
						checked={checkHash}
						action={(s) => setCheckHash(s)}
						title={"Требовать проверку целостности файлов"}
						note={"Эта опция позволяет вам отключать проверку хеша файлов. \nНе рекомендуется отключать, так как обновления файлов не будут скачаны автоматически!"}
					/>
				</div>
				<div className="separator children-zx1" />
				<div className="children-zx1">
					<SettingSwitch id={"installation.overrides.checkFiles"}
						disabled={!forceOverrides}
						checked={checkFiles}
						action={(s) => setCheckFiles(s)}
						title={"Требовать проверку наличия файлов"}
						note={"Эта опция позволяет вам отключать проверку файлов. \nНе рекомендуется отключать, так как отсутствие файлов не будет зарегистрировано!"}
					/>
				</div>
			</div>
			<ModalFooter>
				<button className={buildClassName("grow")} onClick={onCancel}>{"Отмена"}</button>
				<button className={buildClassName("grow", "filled", "colorBrand")} disabled={!hostOnline} onClick={handleSubmit}>{"Создать"}</button>
			</ModalFooter>
		</div>
	);
};

const VersionChooser = () => {

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
		<Modal mini={false} small={false} full={shouldFull}>
			<div className={buildClassName("container", !leftOpen && "left-closed")} id="version-selector">
				<div className="leftColumn">
					<DropdownSelector items={versionTypes} onSelect={handleTypeSelect} />
					<Sidebar type={selectedType} onSelect={handleVersionSelect} selected={selectedVersion} />
				</div>
				<div className="middleColumn">
					{selectedVersion ? (
						<VersionChooserContent version={selectedVersion} onCancel={handleCancel} onBack={handleBack} isLeftOpen={leftOpen} key={selectedVersion.id} />
					) : (
						<div className={buildClassName("main-content", "d-flex", "vertical", "centred")}>
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
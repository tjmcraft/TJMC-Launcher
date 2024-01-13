import React, { createElement, memo, useEffect, useMemo, useState, useRef, useCallback, Fragment } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Store/Global";
import { cleanObject, searchInArray } from "Util/Iterates";
import captureEscKeyListener from "Util/captureEscKeyListener";
import useGlobal from "Hooks/useGlobal";
import useHostOnline from "Hooks/useHostOnline";
import useVirtualBackdrop from "Hooks/useVirtualBackdrop";
import { selectVersions } from "Model/Selectors/installations";

import { Modal, ModalFooter } from "UI/Modal";
import { InputGroup, PathInput, TextInput } from "UI/Input";
import SettingSwitch from "UI/SettingSwitch";

import "./VersionChooser.css";
import useHotkeys from "Hooks/useHotkeys";

const Sidebar = ({
	isActive = false,
	type = undefined,
	onSelect = void 0,
	selected = undefined
}: {
	isActive: boolean,
	type?: VersionType,
	onSelect: AnyToVoidFunction,
	selected?: Version,
}) => {

	const versions = useGlobal(global => selectVersions(global, type), [type]);

	const handleSelect = useCallback((item) => {
		return e => {
			e.stopPropagation();
			if (typeof onSelect === 'function') onSelect(item);
		};
	}, [onSelect]);

	const [searchParam, setSearchParam] = useState("");
	const handleInput = useCallback((e) => {
		e.stopPropagation();
		setSearchParam(e.target.value);
	}, []);
	const handleClear = useCallback(() => setSearchParam(null), []);
	useEffect(() => searchParam && captureEscKeyListener(() => handleClear()), [searchParam, handleClear]);

	const searchRef = useRef<HTMLInputElement>();
	useHotkeys(isActive ? { 'Mod+F': () => searchRef.current?.focus() } : undefined);

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
						searchInArray(versions, searchParam, e => e.id).map((item, i) =>
							<div key={i}
								className={buildClassName('item', 'navItem', selected?.id == item.id && 'selected')}
								onClick={handleSelect(item)}
							>{item.id}</div>)
					)}
				</div>
			</div>
			<div className="sidebar-bottom">
				<TextInput id="versions-search"
					ref={searchRef}
					autoFocusOnOpen={true}
					autoFocus={true}
					placeholder="Введите название версии"
					onChange={handleInput}
					onClear={handleClear}
					value={searchParam}
					small
					withClear
				/>
			</div>
		</Fragment>
	);
};

const DropdownSelector = ({
	title = "Версии",
	items = [],
	onSelect = void 0
}: {
	title?: string;
	items: VersionTypes;
	onSelect: AnyToVoidFunction;
}) => {

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
					<g fill="none" fillRule="evenodd">
						<path d="M0 0h18v18H0" />
						<path stroke="currentColor" d="M4.5 4.5l9 9" strokeLinecap="round" />
						<path stroke="currentColor" d="M13.5 4.5l-9 9" strokeLinecap="round" />
					</g>
				</svg>
			</div>
			<div className={buildClassName('dropdown', !isOpen && "hidden")}>
				{items && items.map(item => createElement('span', { onClick: handleSelect(item) }, item.name))}
			</div>
		</div>
	);
};

const VersionChooserContent = ({
	version,
	onCancel,
	onBack,
	isLeftOpen
}: {
	version: Version;
	onCancel: AnyToVoidFunction;
	onBack: AnyToVoidFunction;
	isLeftOpen: boolean;
}) => {
	const { createInstallation, closeModal } = getDispatch();
	const config = useGlobal(global => global.configuration);
	const hostOnline = useHostOnline();

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
		const data = cleanObject(Object.assign(version_opts_default, {
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

	return (
		<div className={buildClassName("main-content", "d-flex")}>
			<div className="middleHeader">
				<div className="backButton">
					<button onClick={onBack}>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 18 18" className={buildClassName("button-4fai7c", isLeftOpen && "open")}>
							<g fill="none" fillRule="evenodd">
								<path d="M0 0h18v18H0" />
								<path stroke="currentColor" d="M4.5 4.5l9 9" strokeLinecap="round" />
								<path stroke="currentColor" d="M13.5 4.5l-9 9" strokeLinecap="round" />
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
								placeholder={config?.minecraft?.launch?.width.toString() || "<auto>"} />
							<span className="resolutionCross">✖</span>
							<input
								type="number"
								name="installation-resolution-height"
								value={height}
								onChange={(e) => setHeight(e.target.value)}
								placeholder={config?.minecraft?.launch?.height.toString() || "<auto>"} />
						</div>
					</InputGroup>
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
	const versionTypes: VersionTypes = useMemo(() => ([
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

	useEffect(() => getGlobalVersions(), [getGlobalVersions]);
	useEffect(() => (selectedVersion ? captureEscKeyListener(handleCancel) : undefined), [selectedVersion, handleCancel]);
	useEffect(() => {
		const timeout = setTimeout(() => setLeftOpen(!selectedVersion), selectedVersion ? 200 : 100);
		return () => clearTimeout(timeout);
	}, [selectedVersion]);

	return (
		<Modal mini={false} small={false}>
			<div className={buildClassName("container", !leftOpen && "left-closed")} id="version-selector">
				<div className="leftColumn">
					<DropdownSelector
						items={versionTypes}
						onSelect={handleTypeSelect}
					/>
					<Sidebar
						type={selectedType}
						onSelect={handleVersionSelect}
						selected={selectedVersion}
						isActive={leftOpen}
					/>
				</div>
				<div className="middleColumn">
					{selectedVersion ? (
						<VersionChooserContent
							version={selectedVersion}
							onCancel={handleCancel}
							onBack={handleBack}
							isLeftOpen={leftOpen}
							key={selectedVersion.id}
						/>
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
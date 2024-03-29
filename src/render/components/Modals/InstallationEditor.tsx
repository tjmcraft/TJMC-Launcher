import React, { memo, createElement, useState, useMemo } from "react";

import buildClassName from "Util/buildClassName";
import { compareObjects } from "Util/Iterates";
import { getDispatch } from "Store/Global";
import useGlobal from "Hooks/useGlobal";
import useHostOnline from "Hooks/useHostOnline";
import { selectInstallation } from "Model/Selectors/installations";

import { Modal, ModalFooter } from "UI/Modal";
import { InputGroup, PathInput } from "UI/Input";
import SettingSwitch from "UI/SettingSwitch";


const InstallationForm: React.FC<{
	version: HostInstallationWithHash,
	onCancel: AnyToVoidFunction,
}> = ({ version, onCancel }) => {

	const { editInstallation, closeModal } = getDispatch();
	const config = useGlobal(global => global.configuration);
	const hostOnline = useHostOnline();

	const [name, setName] = useState(version.name);
	const [gameDir, setGameDir] = useState(version.gameDir);
	const [width, setWidth] = useState(version.resolution?.width);
	const [height, setHeight] = useState(version.resolution?.height);
	const [javaPath, setJavaPath] = useState(version.javaPath);
	const [javaArgs, setJavaArgs] = useState(version.javaArgs);
	const [forceOverrides, setForceOverrides] = useState(Boolean(version.checkHash || version.checkFiles));
	const [checkHash, setCheckHash] = useState(version.checkHash);
	const [checkFiles, setCheckFiles] = useState(version.checkFiles);

	const version_opts_default = useMemo(() => Object.seal({
		name: version.name ?? 'Версия без имени',
		type: version.type,
		resolution: {
			width: version.resolution?.width,
			height: version.resolution?.height,
		},
		gameDir: version.gameDir,
		javaPath: version.javaPath,
		javaArgs: version.javaArgs,
		checkHash: version.checkHash,
		checkFiles: version.checkFiles,
	}), [version]);

	const handleSubmit = () => {
		console.debug("def", version_opts_default);
		const data = compareObjects(version_opts_default, {
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
				checkHash: checkHash,
				checkFiles: checkFiles,
			} : {})
		});
		if (hostOnline) {
			editInstallation({ hash: version.hash, options: data });
			closeModal();
		}
	};

	return (
		<div className={buildClassName("main-content", "d-flex")}>
			<div className="middleHeader">
				<h2>{version.name ? `Редактирование установки: ${version.name}` : 'Редактирование установки'}</h2>
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
						value={gameDir?.toString()}
					/>
				</div>
				<div className="children-zx1">
					<InputGroup title="Разрешение" htmlFor="installation.resolution.wrap">
						<div className="resolution" id="installation.resolution.wrap">
							<input
								type="number"
								name="installation-resolution-width"
								value={width}
								onChange={(e) => setWidth(Number(e.target.value))}
								placeholder={config?.minecraft?.launch?.width?.toString() || "<auto>"} />
							<span className="resolutionCross">✖</span>
							<input
								type="number"
								name="installation-resolution-height"
								value={height}
								onChange={(e) => setHeight(Number(e.target.value))}
								placeholder={config?.minecraft?.launch?.height?.toString() || "<auto>"} />
						</div>
					</InputGroup>
				</div>
				<div className="children-zx1">
					<PathInput
						type="file"
						title="Путь к Java"
						placeholder="<java по умолчанию>"
						onChange={setJavaPath}
						value={javaPath?.toString()}
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
				<button className={buildClassName("grow", "filled", "colorBrand")} disabled={!hostOnline} onClick={handleSubmit}>{"Сохранить"}</button>
			</ModalFooter>
		</div>
	);
};

const InstallationEditor: React.FC<{ hash: string }> = (props) => {
	const { closeModal } = getDispatch();
	const selectedVersion = useGlobal(global => selectInstallation(global, props.hash));
	console.debug("[InstallationEditor]", props);
	console.debug("[InstallationEditor]", selectedVersion);
	return (
		<Modal mini={true} small={true}>
			<div className={buildClassName("container", "left-closed")} id="version-selector">
				<div className="middleColumn">
					<InstallationForm version={selectedVersion} onCancel={closeModal} key={selectedVersion.hash} />
				</div>
			</div>
		</Modal>
	);
};

export default memo(InstallationEditor);
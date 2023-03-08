import { memo, createElement, useCallback, useMemo, useState, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import buildClassName from "Util/buildClassName.js";
import { getDispatch } from "Util/Store";
import { randomString } from "Util/Random.js";

import useGlobal from "Hooks/useGlobal";
import useHostOnline from "Hooks/useHostOnline";
import { selectCurrentUser } from "Model/Selectors/user.js";
import { selectCurrentTheme } from "Model/Selectors/UI";
import { selectSettings } from "Model/Selectors/Settings";
import platform from "platform";

import { RadioGroup } from "UI/components/Radio.js";
import ToggleSwitch from "UI/components/ToggleSwitch.js";
import RangeSlider from "UI/components/Slider.js";
import { Modal } from "UI/Modals";
import Select from "UI/components/Select";
import MenuItem from "UI/components/MenuItem";
import { PathInput } from "UI/components/Input";

import iconImage from "IMG/icon.png";
import style from "CSS/settings.module.css";
import "CSS/markdown.css";


const SideBarItems = ({ currentScreen, onScreenSelect }) => {

	const hostOnline = useHostOnline();

	const items = useMemo(() => [
		{ type: "header", content: "Настройки пользователя" },
		{ type: "navItem", content: "Моя учётная запись", tab: "my-account", disabled: false },
		{ type: "navItem", content: "Сменить скин", tab: "skin", disabled: false },
		{ type: "separator" },
		{ type: "header", content: "Настройки Игры" },
		{ type: "navItem", content: "Игровые настройки", tab: "minecraft-settings", disabled: !hostOnline },
		{ type: "navItem", content: "Настройки Java", tab: "java-settings", disabled: !hostOnline },
		{ type: "separator" },
		{ type: "header", content: "Настройки Приложения" },
		{ type: "navItem", content: "Внешний вид", tab: "launcher-appearance", disabled: false },
		{ type: "navItem", content: "Настройки лаунчера", tab: "launcher-settings", disabled: false },
		{ type: "separator" },
		{ type: "navItem", content: "О программе", tab: "launcher-about", disabled: false },
		{ type: "separator" },
	], [hostOnline]);

	const handleSelect = (tab) => tab ? () => {
		onScreenSelect(tab);
	} : undefined;

	return (
		<div className="sidebar-items">
			{items.map((e, i) => (
				<div key={i}
					className={buildClassName("item", e.type, e.tab == currentScreen && "selected", e.disabled && "disabled")}
					onClick={handleSelect(e.tab)}>
					{e.content || ''}
				</div>
			))}
		</div>
	);
};

const InfoBox = memo(() => {
	const os = platform.os;
	const host = useGlobal(global => global.hostInfo);
	return (
		<div className={style.sidebarInfo}>
			<span className={buildClassName(style.line, style.size12)}>
				{APP_ENV == "production" ? "Stable" : "Development"} {APP_VERSION} <span className={style.versionHash}>({window.buildInfo.gitHashShort})</span>
			</span>
			<span className={buildClassName(style.line, style.size12)}>{host.hostVersion ? `${host.hostVendor} ${host.hostVersion.version}` : "Web Host"}</span>
			<span className={buildClassName(style.line, style.size12)}>{os ? `${os.family} ${os.version} x${os.architecture}` : "Unknown OS"}</span>
		</div>
	);
});

const SettingContainer = ({ id, action, header, note, checked }) => {
	id = id || randomString(5);
	const onCheck = useCallback((checked) => {
		if (typeof action === "function") action.call(this, checked, id);
	}, [id, action]);
	return (
		<div className={style.settingContainer}>
			<div className={style.labelRow}>
				<label htmlFor={id} className={style.title}>{header || ""}</label>
				<div className={style.control}>
					<ToggleSwitch id={id} checked={Boolean(checked)} onChange={onCheck} />
				</div>
			</div>
			<div className={style.note}>
				<div className={style.description}>{note || ""}</div>
			</div>
			{/* <div className={buildClassName(style.divider, style.dividerDefault)} /> */}
		</div>
	);
};

const SettingContainerTwo = ({
	note = undefined,
	children,
}) => {
	return (
		<div className={style.settingContainer}>
			<div className={style.labelRow}>
				{children}
			</div>
			{note && (
				<div className={style.note}>
					<div className={style.description}>{note}</div>
				</div>
			)}
		</div>
	);
};

const SettingSwitch = ({
	id = undefined,
	title,
	note = undefined,
	action = void 0,
	checked = false,
}) => {
	id = id || randomString(5);
	const onCheck = useCallback((checked) => {
		if (typeof action === "function") action.call(this, checked, id);
	}, [id, action]);
	return (
		<SettingContainerTwo note={note}>
			<label htmlFor={id} className={style.title}>{title || ""}</label>
			<div className={style.control}>
				<ToggleSwitch id={id} checked={Boolean(checked)} onChange={onCheck} />
			</div>
		</SettingContainerTwo>
	);
};

const SettingButton = ({
	id = undefined,
	title,
	note = undefined,
	name,
	action = void 0,
}) => {
	id = id || randomString(5);
	const handleClick = useCallback(() => {
		if (typeof action === "function") action.call(this, id);
	}, [id, action]);
	return (
		<SettingContainerTwo note={note}>
			<label htmlFor={id} className={style.title}>{title || ""}</label>
			<div className={style.control}>
				<button id={id} className={buildClassName("filled", "small")} onClick={handleClick}>{name || "click"}</button>
			</div>
		</SettingContainerTwo>
	);
};

const TabItem = (({ id, children }) => {
	return <div className="tab" id={id}>{children}</div>;
});

const TestContainer = memo(() => {
	const [selectedIndex, selectIndex] = useState(0);
	const [checked, setChecked] = useState(false);
	const [count, setCount] = useState(0);
	const items = [
		"Item 0",
		"Item 1",
		"Item 2",
		"Item 3",
		"Item 4",
		"Item 5",
		"Item 6",
		"Item 7",
		"Item 8",
		"Item 9",
	];
	return (
		<div className={style.settingGroupContainer}>
			<h5>Debug container</h5>
			<div className={style.settingGroup}>
				<div className={style.settingContainer}>
					<div className={style.description}>{"You can use selectable menu"}</div>
					<div className={"test"}>
						<Select title="Select item" value={items[selectedIndex]}>
							{items.map((e, i) => (
								<MenuItem compact
									key={i}
									selected={selectedIndex == i}
									onClick={() => selectIndex(i)}
								>{e}</MenuItem>
							))}
						</Select>
					</div>
				</div>
				<SettingSwitch
					id={"tjmc.app.example.switch"}
					checked={checked}
					action={setChecked}
					note={"Here is the example of setting container toggler. You can switch it!"}
					title={"Toggle this switch"}
				/>
				<SettingButton
					id={"tjmc.app.example.button"}
					note={`Here is the example of setting container button. You can click on it!`}
					title={`Click on button${count > 0 ? `\xa0-\xa0${count}` : ""}`}
					name={"Click"}
					action={() => setCount(s => s + 1)}
				/>
				<SettingSwitch
					id={"tjmc.app.example.switch"}
					checked={checked}
					action={setChecked}
					title={"Toggle this switch with long text inside title box"}
				/>
				<SettingButton
					id={"tjmc.app.example.button"}
					title={`Click on button with long text in title here${count > 0 ? `\xa0-\xa0${count}` : ""}`}
					name={"Click"}
					action={() => setCount(s => s + 1)}
				/>
				<div className={style.settingContainer}>
					<div className={style.description}>{"You can easily write single description text"}</div>
				</div>
			</div>
		</div>
	);
});


const MyAccountTab = memo(() => {

	const { logout } = getDispatch();
	const user = useGlobal(selectCurrentUser);

	const onLogoutClick = useCallback(() => {
		logout();
	}, [logout]);

	return user && (
		<TabItem id="my-account">
			<h2>Моя учётная запись</h2>
			<div className="children">
				<div className={style.settingGroupContainer}>
					<div className="bxcF1-box">
						<div className="ictx-flex">
							<div className="icon">
								<img src={`https://cdn.tjmcraft.ga/avatars/${user.id}/${user.avatar}.png?size=128`} />
							</div>
							<div className={buildClassName("flex-group", "vertical")}>
								<span className={buildClassName("vbx", "cu")}>
									<div className={buildClassName("text", "name")}>{`${user.realname || user.username}`}</div>
									<div className={buildClassName("text", "id")}>{`#${user.discriminator}`}</div>
								</span>
								{user.permission_display_name && (
									<div className={buildClassName("sizeW", "colorStandart", "subtitle-p")}>{user.permission_display_name}</div>
								)}
							</div>
							{/* <button className={buildClassName("r", "filled", "colorBrand")}>{"Профиль"}</button> */}
						</div>
						<div className="separator" />
						<div className="fieldList">
							<div className="field" data-type="email">
								<div className="containedRow">
									<div>
										<h5>{"Email"}</h5>
										<div>
											<span className="colorHeaderPrimary">{user.email}</span>
										</div>
									</div>
								</div>
								<button className="filled">{"Изменить"}</button>
							</div>
						</div>
						<button className={buildClassName("filled", "colorRed", "w100")} onClick={onLogoutClick}>{"Выйти"}</button>
					</div>
				</div>
				{APP_ENV == "development" && (
					<TestContainer />
				)}
			</div>
		</TabItem>
	);
});

const SkinTab = memo(() => {

	return (
		<TabItem id="skin">
			<h2>Конфигурация скина</h2>
			<div className="children">
				<div className={style.settingGroupContainer}>
					<h5>skin</h5>
				</div>
			</div>
		</TabItem>
	);
});

const MinecraftSettingsTab = memo(() => {

	const { setConfig } = getDispatch();
	const config = useGlobal(global => global.configuration);

	const [width, setWidth] = useState("0");
	const [height, setHeight] = useState("0");

	useEffect(() => setWidth(config?.minecraft?.launch?.width), [config?.minecraft?.launch?.width]);
	useEffect(() => setHeight(config?.minecraft?.launch?.height), [config?.minecraft?.launch?.height]);

	const handleSaveConfigWidth = useCallback(() => {
		setConfig({ key: "minecraft.launch.width", value: width });
	}, [setConfig, width]);
	const handleSaveConfigHeight = useCallback(() => {
		setConfig({ key: "minecraft.launch.height", value: height });
	}, [setConfig, height]);

	return (
		<TabItem id="minecraft-settings">
			<h2>Настройки Minecraft</h2>
			{config ? (
				<div className="children">
					<div className={style.settingGroupContainer}>
						<h5>Параметры окна</h5>
						<div className="resolution" id="settings.resolution.wrap">
							<input
								type="number"
								name="settings-resolution-width"
								value={width}
								onChange={(e) => setWidth(e.target.value)}
								onBlur={handleSaveConfigWidth}
								placeholder={"<auto>"} />
							<span className="resolutionCross">✖</span>
							<input
								type="number"
								name="settings-resolution-height"
								value={height}
								onChange={(e) => setHeight(e.target.value)}
								onBlur={handleSaveConfigHeight}
								placeholder={"<auto>"} />
						</div>
						<div className={style.settingGroup}>
							<SettingContainer id="minecraft.launch.fullscreen"
								header="Запускать в полноэкранном режиме"
								note="Принудительно использовать режим fullscreen для нового окна"
								checked={config.minecraft.launch.fullscreen}
								action={(s) => {
									setConfig({ key: "minecraft.launch.fullscreen", value: s });
								}}
							/>
						</div>
					</div>
					<div className={style.settingGroupContainer}>
						<h5>Параметры запуска</h5>
						<div className={style.settingGroup}>
							<SettingContainer id="overrides.autoConnect"
								header="Автоматически подключаться к серверу ТюменьCraft"
								note="Подключаться к серверу автоматически, при запуске игры"
								checked={false}
								action={(s, n) => {
									console.debug(n, "=>", s);
								}}
							/>
						</div>
					</div>
					<div className={style.settingGroupContainer}>
						<h5>Параметры загрузки</h5>
						<div className={style.settingGroup}>
							<SettingContainer id="overrides.checkHash"
								header="Проверять Hash файлов"
								note={"Эта опция позволяет вам отключать проверку хеша файлов. \nНе рекомендуется отключать, так как обновления файлов не будут скачаны автоматически!"}
								checked={config.overrides.checkHash}
								action={(s) => {
									setConfig({ key: "overrides.checkHash", value: s });
								}}
							/>
						</div>
					</div>
				</div>
			) : (
				<div className="children">
					<h5>No config loaded!</h5>
				</div>
			)}
		</TabItem>
	);
});

const JavaSettingsTab = memo(() => {

	const { setConfig } = getDispatch();
	const config = useGlobal(global => global.configuration);

	const handleChangeJavaPath = useCallback((javaPath) => {
		setConfig({ key: "java.javaPath", value: javaPath });
	}, [setConfig]);

	return (
		<TabItem id="java-settings">
			<h2>Настройки Java</h2>
			{config ? (
				<div className="children">
					<div className={style.settingGroupContainer}>
						<h5>Исполняемый файл</h5>
						<div className={""}>
							<PathInput
								type="file"
								placeholder="<java>"
								onChange={handleChangeJavaPath}
								value={config?.java?.javaPath}
							/>
						</div>
					</div>
					<div className={style.settingGroupContainer}>
						<h5>Использование памяти</h5>
						<div className={style.settingGroup}>
							<div className={buildClassName(style.settingContainer)}>
								<div className={buildClassName("flex-group", "vertical")}>
									<div className={buildClassName("flex-child", "flex-group", "vertical")}>
										<h5>Максимальное использование памяти</h5>
										<RangeSlider id="java-memory-max"
											value={Math.round((config.java.memory.max / 1024) * 1000) / 1000}
											min={0.5}
											max={8}
											step={0.1}
											unit="Gb"
											onChange={(s) => {
												setConfig({ key: "java.memory.max", value: Math.floor(s * 1024) });
											}}
										/>
									</div>
									<div className={buildClassName("flex-child", "flex-group", "vertical")}>
										<h5>Минимальное использование памяти</h5>
										<RangeSlider id="java-memory-min"
											value={Math.round((config.java.memory.min / 1024) * 1000) / 1000}
											min={0.5}
											max={5}
											step={0.1}
											unit="Gb"
											onChange={(s) => {
												setConfig({ key: "java.memory.min", value: Math.floor(s * 1024) });
											}}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className={style.settingGroupContainer}>
						<h5>Дополнительно</h5>
						<div className={style.settingGroup}>
							<SettingContainer id="java.detached"
								header="Независимый процесс"
								note="Если этот параметр выключен, то при закрытии лаунчера, автоматически закроется процесс игры"
								checked={config.java.detached}
								action={(s) => {
									setConfig({ key: "java.detached", value: s });
								}}
							/>
						</div>
					</div>
				</div>
			) : (
				<div className="children">
					<h5>No config loaded!</h5>
				</div>
			)}
		</TabItem>
	);
});

const LauncherSettingsTab = memo(() => {

	const { setSettings, setConfig, alert } = getDispatch();
	const settings = useGlobal(selectSettings);
	const config = useGlobal(global => global.configuration);
	const hostOnline = useHostOnline();

	return (
		<TabItem id="launcher-settings">
			<h2>Настройки Лаунчера</h2>
			<div className="children">
				{hostOnline && config && (
					<div className={style.settingGroupContainer}>
						<h5>Настройки клиента</h5>
						<div className={style.settingGroup}>
							<SettingContainer
								id="launcher.checkUpdates"
								header="Проверять обновления"
								note="Отключение этого параметра позволяет пропускать проверку обновлений при холодном запуске."
								checked={config.launcher.checkUpdates}
								action={(s) => {
									setConfig({ key: "launcher.checkUpdates", value: s });
								}}
							/>
							<SettingContainer
								id="launcher.hideOnClose"
								header="Скрывать при закрытии"
								note="Включение этого параметра позволяет скрывать лаунчер в трей при нажатии на кнопку закрыть."
								checked={config.launcher.hideOnClose}
								action={(s) => {
									setConfig({ key: "launcher.hideOnClose", value: s });
								}}
							/>
							<SettingContainer
								id="launcher.disableHardwareAcceleration"
								header="Отключить программную акселерацию"
								note="Включение этого параметра позволяет отключить программное ускорение. Может вызвать проблемы на некоторых системах!"
								checked={config.launcher.disableHardwareAcceleration}
								action={(s) => {
									alert({
										title: `${s ? "Отключение" : "Включение"} программного ускорения`,
										content: `Изменение этого параметра может вызвать подвисания или полный отказ приложения. Используйте эту опцию, только если уверенны в том что делаете! Вы действительно хотите ${s ? "включить" : "выключить"} этот параметр?`,
										type: "warn",
										buttons: [
											{
												name: "Отмена",
												closeOverlay: true,
											},
											{
												name: `${s ? "Отключить" : "Включить"}`,
												class: ["filled", "colorRed"],
												closeOverlay: true,
												callback: () => {
													setConfig({ key: "launcher.disableHardwareAcceleration", value: Boolean(s) });
												}
											}
										],
										mini: true,
									});

								}}
							/>
							<SettingContainer
								id="launcher.openDevTools"
								header="Открывать средства разработчика"
								note="Включение этого параметра позволяет скрывать и показывать средства разработчика"
								checked={config.launcher.openDevTools}
								action={(s) => {
									setConfig({ key: "launcher.openDevTools", value: s });
								}}
							/>
						</div>
					</div>
				)}
				<div className={style.settingGroupContainer}>
					<h5>Базовая Отладка</h5>
					<div className={style.settingGroup}>
						<SettingContainer
							id="app.debug.mode"
							header="Использование режима отладки"
							note="Включение этого параметра позволяет разработчикам получать больше данных об ошибках в консоли приложения."
							checked={settings.debug_mode}
							action={(s) => {
								alert({
									title: "Изменение режима отладки",
									content: "Изменение параметра режима отладки требует перезапуска приложения. Вы уверенны что хотите это сделать?",
									type: "warn",
									buttons: [
										{
											name: "Отмена",
											closeOverlay: true,
										},
										{
											name: "Ок",
											class: ["filled", "colorBrand"],
											closeOverlay: true,
											callback: () => {
												setSettings({ debug_mode: Boolean(s) });
											}
										}
									],
									mini: true,
								});
							}}
						/>
					</div>
				</div>
				<div className={style.settingGroupContainer}>
					<h5>Отладка сетевых данных</h5>
					<div className={style.settingGroup}>
						<SettingContainer
							id="app.debug.host"
							header="Высерание данных для отладки хоста"
							note="Эта настройка позволяет разработчикам получать дополнительную информацию о взаимодействии клиента с хостом через IPC или TCHost соединение"
							checked={settings.debug_host}
							action={(s) => {
								alert({
									title: "Изменение режима отладки",
									content: "Изменение параметра режима отладки требует перезапуска приложения. Вы уверенны что хотите это сделать?",
									type: "warn",
									buttons: [
										{
											name: "Отмена",
											closeOverlay: true,
										},
										{
											name: "Ок",
											class: ["filled", "colorBrand"],
											closeOverlay: true,
											callback: () => {
												setSettings({ debug_host: Boolean(s) });
											}
										}
									],
									mini: true,
								});
							}}
						/>
						<SettingContainer
							id="app.debug.api"
							header="Высерание данных для отладки API"
							note="Этот параметр позволяет разработчикам получать необязательную информацию о запросах происходящих между клиентом и TJMC API"
							checked={settings.debug_api}
							action={(s) => {
								alert({
									title: "Изменение режима отладки",
									content: "Изменение параметра режима отладки требует перезапуска приложения. Вы уверенны что хотите это сделать?",
									type: "warn",
									buttons: [
										{
											name: "Отмена",
											closeOverlay: true,
										},
										{
											name: "Ок",
											class: ["filled", "colorBrand"],
											closeOverlay: true,
											callback: () => {
												setSettings({ debug_api: Boolean(s) });
											}
										}
									],
									mini: true,
								});
							}}
						/>
					</div>
				</div>
			</div>
		</TabItem>
	);
});

const LauncherAppearanceTab = memo(() => {

	const { setSettings, setTheme } = getDispatch();
	const settings = useGlobal(selectSettings);
	const theme = useGlobal(selectCurrentTheme);

	return (
		<TabItem id="launcher-appearance">
			<h2>Внешний вид</h2>
			<div className="children">
				<div className={style.settingGroupContainer}>
					<h5>Тема</h5>
					<RadioGroup
						direction="vertical"
						checked={theme}
						options={{
							dark: (<span>Тёмная</span>),
							light: (<span>Светлая</span>),
							system: (<span>Синхронизация с ПК</span>),
						}}
						action={(theme) => {
							setTheme(theme);
						}}
					/>
					<div className={style.settingGroup}>
						<SettingContainer
							id="exp.settings.more_border"
							header="Режим чётких границ"
							note="Включение этого параметра позволяет использовать экспериментальный режим повышенной чёткости границ."
							checked={settings.exp_more_border}
							action={(s) => {
								setSettings({ exp_more_border: Boolean(s) });
							}}
						/>
					</div>
				</div>
				<div className={style.settingGroupContainer}>
					<h5>Общие</h5>
					<div className={style.settingGroup}>
						<SettingContainer
							id="app.settings.fullmode"
							header="Использовать настройки в полноэкранном режиме"
							note="Включение этого параметра позволяет использовать настройки в полноэкранном режиме"
							checked={settings.full_settings}
							action={(s) => {
								setSettings({ full_settings: Boolean(s) });
							}}
						/>
						<SettingContainer
							id="app.chooser.fullmode"
							header="Использовать установщик версии в полноэкранном режиме"
							note="Включение этого параметра позволяет использовать установщик версии в полноэкранном режиме"
							checked={settings.full_chooser}
							action={(s) => {
								setSettings({ full_chooser: Boolean(s) });
							}}
						/>
					</div>
				</div>
				<div className={style.settingGroupContainer}>
					<h5>Дополнительно</h5>
					<div className={style.settingGroup}>
						<SettingContainer
							id="app.preloader.mode"
							header="Использовать прелоадер"
							note="Выключение этого параметра позволяет принудительно отключать анимацию первоначальной загрузки приложения"
							checked={settings.enable_preloader}
							action={(s) => {
								setSettings({ enable_preloader: Boolean(s) });
							}}
						/>
						{APP_ENV == "development" && (
							<SettingContainer
								id="app.dev.faloc_disable"
								header="Отключить сообщение о предварительной версии"
								note="Включение этого параметра отключает появление сообщение о предварительной версии при запуске UI"
								checked={settings.dev_disable_faloc}
								action={(s) => {
									setSettings({ dev_disable_faloc: Boolean(s) });
								}}
							/>
						)}
					</div>
				</div>
			</div>
		</TabItem>
	);
});

const UpdatesContainer = memo(() => {

	const { updateCheck, updateDownload, updateInstall } = getDispatch();
	const updateStatus = useGlobal(global => global.updateStatus);

	const titleName = {
		"not-available": "Нет обновлений",
		available: "Доступно обновление",
		checking: "Проверка обновлений...",
		error: "Ошибка обновления",
		loaded: "Загружено обновление",
	}[updateStatus] || "Unknown update status";

	const buttonName = {
		"not-available": "Проверить",
		available: "Скачать",
		checking: "Подождите...",
		error: "Ошибка",
		loaded: "Перезапустить",
	}[updateStatus] || "Action";

	const updateAction = useCallback(() => {
		return ({
			"not-available": updateCheck,
			available: updateDownload,
			loaded: updateInstall,
		})[updateStatus] || (() => {});
	}, [updateStatus, updateCheck, updateDownload, updateInstall]);

	return (
		<div className={style.settingGroup}>
			<SettingContainerTwo>
				<label className={style.title}>{titleName}</label>
				<div className={style.control}>
					<button id={"updates.check"} className={buildClassName("filled", "small", "colorBrand")} onClick={updateAction}>{buttonName}</button>
				</div>
			</SettingContainerTwo>
		</div>
	);
});

const AboutTab = memo(() => {

	const { openWhatsNewModal } = getDispatch();
	const releases = useGlobal(global => global.releases);

	const whats_new_click = useCallback(() => {
		openWhatsNewModal();
	}, [openWhatsNewModal]);

	return (
		<TabItem id="launcher-about">
			<h2>О программе</h2>
			<div className="children">
				<div className={style.settingGroupContainer}>
					<div className="bxcF1-box">
						<div className={buildClassName("pctx-flex")}>
							<div className="ictx-flex">
								<div className="icon"><img src={iconImage} /></div>
								<div className={buildClassName("flex-group", "vertical")}>
									<span className="vbx">
										<div className={buildClassName("text", "name")}>{APP_NAME}</div>
										<div className={buildClassName("text", "version")}>v{APP_VERSION}</div>
									</span>
									<div className={buildClassName("sizeW", "colorStandart", "subtitle-p")}>
										<span>Играйте, не обляпайтесь!</span>
									</div>
								</div>
							</div>
							<button className={buildClassName("r", "filled", "colorBrand")} onClick={whats_new_click}>
								<span>Подробнее</span>
							</button>
						</div>
						<div className="separator" />
						<div className={buildClassName("note", "nowrap", "tran-s")}>
							<div className="description">{APP_COPYRIGHT}</div>
							<span className={buildClassName("flex-group", "horizontal")}>
								<a href="https://github.com/tjmcraft/TJMC-Launcher" className="anchor" target="_blank" rel="noreferrer">Source (GitHub)</a>
								<a href="https://www.tjmcraft.ga/help" className="anchor" target="_blank" rel="noreferrer">Поддержка</a>
								<a href="https://www.tjmcraft.ga/launcher" className="anchor" target="_blank" rel="noreferrer">Сайт</a>
							</span>
						</div>
					</div>
					<UpdatesContainer />
					<div className="bxcF1-box">
						<h5>Просмотр информации о предыдущих релизах</h5>
						<div className="separator" />
						<div className="flex-group vertical">
							{releases && releases.map((release, i) => release.tag_name != `v${APP_VERSION}` && (
								<div key={i} className={buildClassName("release", "w100")}>
									<div className={buildClassName("pctx-flex", "alt")}>
										<div className={buildClassName("ictx-flex", "align-top")}>
											<div className="icon">
												<img src={release.author.avatar_url} />
												<span>{release.author.login}</span>
											</div>
											<div className={buildClassName("flex-group", "vertical", "w100", "text-sel")}>
												<span className="vbx">
													<a href={release.html_url} className={buildClassName("text", "name", "sizeE")}>{release.name}</a>
													<div className={buildClassName("text", "version", "sizeQ")}>#{release.id}</div>
												</span>
												<div className={buildClassName("colorStandart", "size14")}>
													<span className="markdown">
														<Markdown remarkPlugins={[remarkGfm]} children={release.body} />
													</span>
												</div>
											</div>
										</div>
									</div>
									{releases.length - 1 != i && <div className="separator" />}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</TabItem>
	);
});

const ActiveTab = ({ current }) => {
	switch (current) {
		case "my-account":
			return (<MyAccountTab />);
		case "skin":
			return (<SkinTab />);
		case "minecraft-settings":
			return (<MinecraftSettingsTab />);
		case "java-settings":
			return (<JavaSettingsTab />);
		case "launcher-settings":
			return (<LauncherSettingsTab />);
		case "launcher-appearance":
			return (<LauncherAppearanceTab />);
		case "launcher-about":
			return (<AboutTab />);
		default:
			return (<h5>Loading...</h5>);
	}
};

const Settings = (props) => {

	const { selectSettingsScreen } = getDispatch();
	const currentSettingsScreen = useGlobal(global => global.currentSettingsScreen);

	const handleScreenSelect = useCallback((screen) => {
		selectSettingsScreen(screen);
	}, [selectSettingsScreen]);

	const { full_settings: shouldFull } = useGlobal(global => global.settings);

	return (
		<Modal {...props} full={shouldFull}>
			<div className="sidebarView" id="user-settings">
				<div className="sidebar-region">
					<div className="sidebar">
						<SideBarItems
							currentScreen={currentSettingsScreen}
							onScreenSelect={handleScreenSelect}
						/>
						<InfoBox />
					</div>
				</div>
				<div className="content-region">
					<div className="transitionWrap">
						<div className={buildClassName("content", "auto-s", !shouldFull && "centred")}>
							<ActiveTab current={currentSettingsScreen} />
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default memo(Settings);
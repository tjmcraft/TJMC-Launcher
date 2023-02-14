import { memo, createElement, useCallback, useMemo, useState } from "react";

import buildClassName from "Util/buildClassName.js";
import { getDispatch } from "Util/Store";
import { randomString } from "Util/Random.js";

import useGlobal from "Hooks/useGlobal";
import useHostOnline from "Hooks/useHostOnline";
import { selectCurrentUser } from "Model/Selectors/user.js";
import { selectCurrentTheme } from "Model/Selectors/UI";
import { selectSettings } from "Model/Selectors/Settings";

import { RadioGroup } from "UI/components/Radio.js";
import ToggleSwitch from "UI/components/ToggleSwitch.js";
import RangeSlider from "UI/components/Slider.js";
import { Modal } from "UI/Modals";
import Select from "UI/components/Select";
import MenuItem from "UI/components/MenuItem";

import iconImage from "IMG/icon.png";
import style from "CSS/settings.module.css";


const SideBarItems = memo(({ currentScreen, onScreenSelect }) => {

	const hostOnline = useHostOnline();

	const items = useMemo(() => [
		{ type: "header", content: "Настройки пользователя" },
		{ type: "navItem", content: "Моя учётная запись", tab: "my-account-tab", disabled: false },
		{ type: "navItem", content: "Сменить скин", tab: "skin-tab", disabled: false },
		{ type: "separator" },
		{ type: "header", content: "Настроки Игры" },
		{ type: "navItem", content: "Игровые настройки", tab: "minecraft-settings-tab", disabled: !hostOnline },
		{ type: "navItem", content: "Настройки Java", tab: "java-settings-tab", disabled: !hostOnline },
		{ type: "separator" },
		{ type: "header", content: "Настроки Приложения" },
		{ type: "navItem", content: "Внешний вид", tab: "launcher-appearance-tab", disabled: false },
		{ type: "navItem", content: "Настройки лаунчера", tab: "launcher-settings-tab", disabled: false },
		{ type: "separator" },
		{ type: "navItem", content: "О программе", tab: "launcher-about-tab", disabled: false },
		{ type: "separator" },
	], [hostOnline]);

	const handleSelect = (tab) => tab ? () => {
		onScreenSelect(tab);
	} : undefined;

	return (
		<div class="sidebar-items">
			{items.map((e, i) => (
				<div key={i}
					className={buildClassName("item", e.type, e.tab == currentScreen && "selected")}
					onClick={handleSelect(e.tab)}
					tab={e.tab}
					disabled={e.disabled}>
					{e.content || ''}
				</div>
			))}
		</div>
	);
});

const InfoBox = memo(() => {
	const os = platform.os;
	const host = useGlobal(global => global.hostInfo);
	return (
		<div class={style.sidebarInfo}>
			<span class={buildClassName(style.line, style.size12)}>
				{APP_ENV == "production" ? "Stable" : "Development"} {APP_VERSION} <span class={style.versionHash}>({window.buildInfo.gitHashShort})</span>
			</span>
			<span class={buildClassName(style.line, style.size12)}>{host.hostVersion ? `${host.hostVendor} ${host.hostVersion.version}` : "Web Host"}</span>
			<span class={buildClassName(style.line, style.size12)}>{os ? `${os.family} ${os.version} x${os.architecture}` : "Unknown OS"}</span>
		</div>
	);
});

const SettingContainer = memo(({id, action, header, note, checked}) => {
	id = id || randomString(5);
	const onCheck = useCallback((checked) => {
		if (typeof action === "function") action.call(this, checked, id);
	}, [id, action]);
	return (
		<div class={style.settingContainer}>
			<div class={style.labelRow}>
				<label for={id} class={style.title}>{header || ""}</label>
				<div class={style.control}>
					<ToggleSwitch id={id} checked={Boolean(checked)} onChange={onCheck} />
				</div>
			</div>
			<div class={style.note}>
				<div class={style.description}>{note || ""}</div>
			</div>
			<div class={buildClassName(style.divider, style.dividerDefault)} />
		</div>
	);
});

const TabItem = ({ id, children }) => {
	return (<div className="tab" id={id}>{children}</div>);
};


const MyAccountTab = memo(({ isActive }) => {

	const { logout } = getDispatch();
	const user = useGlobal(selectCurrentUser);

	const onLogoutClick = useCallback(() => {
		logout();
	}, [logout]);

	return isActive && user && (
		<TabItem id="my-account-tab">
			<h2>Моя учётная запись</h2>
			<div class="children">
				<div class={style.settingGroupContainer}>
					<div class="bxcF1-box">
						<div class="ictx-flex">
							<div class="icon">
								<img src={`https://cdn.tjmcraft.ga/avatars/${user.id}/${user.avatar}.png?size=128`} />
							</div>
							<div class={buildClassName("flex-group", "vertical")}>
								<span class={buildClassName("vbx", "cu")}>
									<div class={buildClassName("text", "name")}>{`${user.realname || user.username}`}</div>
									<div class={buildClassName("text", "id")}>{`#${user.discriminator}`}</div>
								</span>
								{user.permission_display_name && (
									<div class={buildClassName("sizeW", "colorStandart", "subtitle-p")}>{user.permission_display_name}</div>
								)}
							</div>
							<button class={buildClassName("r", "filled", "colorBrand")}>{"Профиль"}</button>
						</div>
						<div class="separator" />
						<div class="fieldList">
							<div class="field" data-type="email">
								<div class="containedRow">
									<div>
										<h5>{"Email"}</h5>
										<div>
											<span class="colorHeaderPrimary">{user.email}</span>
										</div>
									</div>
								</div>
								<button class="filled">{"Изменить"}</button>
							</div>
						</div>
						<button class={buildClassName("filled", "colorRed", "w100")} onClick={onLogoutClick}>{"Выйти"}</button>
					</div>
					<div class={buildClassName(style.divider, style.dividerDefault)} />
				</div>
				<div class={style.settingGroupContainer}>
					<h5>Дополнительно</h5>
					<div class={style.settingContainer}>
						<div class={style.description}>{"no content here"}</div>
						<div class={buildClassName(style.divider, style.dividerDefault)} />
					</div>
					{APP_ENV == "development" && (
						<div class={style.settingContainer}>
							<div class={style.description}>{"UI Test"}</div>
							<div class={"test"}>
								<Select title="Params select">
									<MenuItem compact>Item 1</MenuItem>
									<MenuItem compact>Item 2</MenuItem>
									<MenuItem compact>Item 3</MenuItem>
									<MenuItem compact>Item 4</MenuItem>
									<MenuItem compact>Item 5</MenuItem>
									<MenuItem compact>Item 6</MenuItem>
									<MenuItem compact>Item 7</MenuItem>
									<MenuItem compact>Item 8</MenuItem>
									<MenuItem compact>Item 9</MenuItem>
									<MenuItem compact>Item 10</MenuItem>
									<MenuItem compact>Item 11</MenuItem>
								</Select>
							</div>
							<div class={buildClassName(style.divider, style.dividerDefault)} />
						</div>
					)}
				</div>
			</div>
		</TabItem>
	);
});

const SkinTab = memo(({ isActive }) => {

	return isActive && (
		<TabItem id="skin-tab">
			<h2>Конфигурация скина</h2>
			<div class="children">
				<div class={style.settingGroupContainer}>
					<h5>skin</h5>
				</div>
			</div>
		</TabItem>
	);
});

const MinecraftSettingsTab = memo(({ isActive }) => {

	const { setConfig } = getDispatch();
	const config = useGlobal(global => global.configuration);

	return isActive && (
		<TabItem id="minecraft-settings-tab">
			<h2>Настройки Minecraft</h2>
			{config ? (
				<div class="children">
					<div class={style.settingGroupContainer}>
						<h5>Параметры загрузки</h5>
						<SettingContainer id="overrides.checkHash"
							header="Проверять Hash файлов"
							note={"Эта опция позволяет вам отлючать проверку хэша файлов. \nНе рекомендуется отключать, так как обновления файлов не будут скачанны автоматически!"}
							checked={config.overrides.checkHash}
							action={(s) => {
								setConfig({ key: "overrides.checkHash", value: s });
							}}
						/>
						<h5>Параметры запуска</h5>
						<SettingContainer id="minecraft.launch.fullscreen"
							header="Запускать в режиме Fullscreen"
							note="Запускать игру, принудительно в полноэкранном режиме"
							checked={config.minecraft.launch.fullscreen}
							action={(s) => {
								setConfig({ key: "minecraft.launch.fullscreen", value: s });
							}}
						/>
						<SettingContainer id="overrides.autoConnect"
							header="Автоматически подключаться к серверу"
							note="Подключаться к серверу автоматически, при запуске игры"
							checked={false}
							action={(s, n) => {
								console.debug(n, "=>", s);
							}}
						/>
					</div>
				</div>
			) : (
				<div class="children">
					<h5>No config loaded!</h5>
				</div>
			)}
		</TabItem>
	);
});

const JavaSettingsTab = memo(({ isActive }) => {

	const { setConfig } = getDispatch();
	const config = useGlobal(global => global.configuration);

	return isActive && (
		<TabItem id="java-settings-tab">
			<h2>Настройки Java</h2>
			{config ? (
				<div class="children">
					<div class={style.settingGroupContainer}>
						<div class={buildClassName("flex-group", "horizontal")}>
							<div class="flex-child">
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
							<div class="flex-child">
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
						<div class={buildClassName(style.divider, style.dividerDefault)} />
					</div>
					<div class={style.settingGroupContainer}>
						<h5>Дополнительно</h5>
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
			) : (
				<div class="children">
					<h5>No config loaded!</h5>
				</div>
			)}
		</TabItem>
	);
});

const LauncherSettingsTab = memo(({ isActive }) => {

	const { setSettings, setConfig, alert } = getDispatch();
	const settings = useGlobal(selectSettings);
	const config = useGlobal(global => global.configuration);
	const hostOnline = useHostOnline();

	return isActive && (
		<TabItem id="launcher-settings-tab">
			<h2>Настройки Лаунчера</h2>
			<div class="children">
				{hostOnline && config && (
					<div class={style.settingGroupContainer}>
						<h5>Настройки клиента</h5>
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
							note="Включение этого параметра позволяет отключить програмное ускорение. Может вызвать проблемы на некоторых системах!"
							checked={config.launcher.disableHardwareAcceleration}
							action={(s) => {
								alert({
									title: `${s ? "Отключение" : "Включение"} программного ускорения`,
									content: `Изменение этого параметра может вызвать подвисания или полный отказ приложения. Используйте эту опцию, только если уверенны в том что делаете! Вы дествительно хотите ${s ? "включить" : "выключить"} этот параметр?`,
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
												setConfig({ key: "launcher.disableHardwareAcceleration", value: Boolean(s) });
											}
										}
									],
									mini: true,
								});

							}}
						/>
					</div>
				)}
				<div class={style.settingGroupContainer}>
					<h5>Базовая Отладка</h5>
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
				<div class={style.settingGroupContainer}>
					<h5>Отладка сетевых данных</h5>
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
		</TabItem>
	);
});

const LauncherAppearanceTab = memo(({ isActive }) => {

	const { setSettings, setTheme } = getDispatch();
	const settings = useGlobal(selectSettings);
	const theme = useGlobal(selectCurrentTheme);

	return isActive && (
		<TabItem id="launcher-appearance-tab">
			<h2>Внешний вид</h2>
			<div class="children">
				<div class={style.settingGroupContainer}>
					<h5>Тема</h5>
					<RadioGroup
						direction="vertical"
						checked={theme}
						options={{
							dark: (<span>Тёмная</span>),
							light: (<span>Светлая</span>),
							system: (<span>Сонхронизация с ПК</span>),
						}}
						action={(theme) => {
							setTheme(theme);
						}}
					/>
				</div>
				<div class={style.settingGroupContainer}>
					<h5>Дополнительно</h5>
					<SettingContainer
						id="app.preloader.mode"
						header="Использовать прелоадер"
						note="Выключение этого параметра позволяет принудительно отключать анимацию первоначальной загрузки приложения"
						checked={settings.enable_preloader}
						action={(s) => {
							setSettings({ enable_preloader: Boolean(s) });
						}}
					/>
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
		</TabItem>
	);
});

const AboutTab = memo(({ isActive }) => {

	const { openWhatsNewModal } = getDispatch();
	const releases = useGlobal(global => global.releases);

	const whats_new_click = useCallback(() => {
		openWhatsNewModal();
	}, [openWhatsNewModal]);

	const handleReleaseMoreClick = useCallback((url) => {
		return () => window.open(url, "_blank");
	}, []);

	return isActive && (
		<TabItem id="launcher-about-tab">
			<h2>О программе</h2>
			<div class="children">
				<div class={style.settingGroupContainer}>
					<div class="bxcF1-box">
						<div class="ictx-flex">
							<div class="icon"><img src={iconImage} /></div>
							<div class={buildClassName("flex-group", "vertical")}>
								<span class="vbx">
									<div class={buildClassName("text", "name")}>{APP_NAME}</div>
									<div class={buildClassName("text", "version")}>v{APP_VERSION}</div>
								</span>
								<div class={buildClassName("sizeW", "colorStandart", "subtitle-p")}>
									<span>Играйте, не обляпайтесь!</span>
								</div>
							</div>
							<button class={buildClassName("r", "filled", "colorBrand")} onclick={whats_new_click}>
								<span>Подробнее</span>
							</button>
						</div>
						<div class="separator" />
						<div class={buildClassName("note", "flex-group")}>
							<div class="description">{APP_COPYRIGHT}</div>
							<a href="https://github.com/tjmcraft/TJMC-Launcher" class="anchor" target="_blank" rel="noreferrer">Source (GitHub)</a>
							<a href="https://www.tjmcraft.ga/help" class="anchor" target="_blank" rel="noreferrer">Поддержка</a>
							<a href="https://www.tjmcraft.ga/launcher" class="anchor" target="_blank" rel="noreferrer">Сайт</a>
						</div>
					</div>
					<div class="bxcF1-box">
						<h5>Просмотр информации о предыдущих релизах</h5>
						<div class="separator" />
						<div class="flex-group vertical">
							{releases && releases.map((release, i) => (
								<div key={i} className={buildClassName("release", "w100")}>
									<div className={buildClassName("ictx-flex", "align-top")}>
										<div class="icon">
											<img src={release.author.avatar_url} />
											<span>{release.author.login}</span>
										</div>
										<div class={buildClassName("flex-group", "vertical", "w100", "text-sel")}>
											<span class="vbx">
												<div class={buildClassName("text", "name", "sizeE")}>{release.name}</div>
												<div class={buildClassName("text", "version", "sizeQ")}>#{release.id}</div>
											</span>
											<div class={buildClassName("colorStandart", "size14")}>
												<span>{release.body}</span>
											</div>
										</div>
										<button className={buildClassName("r")} onClick={handleReleaseMoreClick(release.html_url)}>
											<span>Подробнее</span>
										</button>
									</div>
									{releases.length-1 != i && <div class="separator" />}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</TabItem>
	);
});

const Settings = memo((props) => {

	const [activeTab, setTab] = useState(props.tab || "my-account-tab");

	const handleScreenSelect = useCallback((screen) => {
		setTab(screen);
	}, [setTab]);

	const { full_settings: shouldFull } = useGlobal(global => global.settings);

	return (
		<Modal {...props} full={shouldFull}>
			<div class="sidebarView" id="user-settings">
				<div class="sidebar-region">
					<div class="sidebar">
						<SideBarItems
							currentScreen={activeTab}
							onScreenSelect={handleScreenSelect}
						/>
						<InfoBox />
					</div>
				</div>
				<div class="content-region">
					<div class="transitionWrap">
						<div class={buildClassName("content", "auto-s", !shouldFull && "centred")}>
							{!activeTab && <h5>Loading...</h5>}
							<MyAccountTab isActive={activeTab == "my-account-tab"} />
							<SkinTab isActive={activeTab == "skin-tab"} />
							<MinecraftSettingsTab isActive={activeTab == "minecraft-settings-tab"} />
							<JavaSettingsTab isActive={activeTab == "java-settings-tab"} />
							<LauncherSettingsTab isActive={activeTab == "launcher-settings-tab"} />
							<LauncherAppearanceTab isActive={activeTab == "launcher-appearance-tab"} />
							<AboutTab isActive={activeTab == "launcher-about-tab"} />
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
});

export default Settings;
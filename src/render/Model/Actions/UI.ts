import { addModal, closeModal, unloadModal } from "Model/Reducers/ui";
import { debounce } from "Util/Shedulers";
import { addCallback, addReducer, getState, setState } from "Store/Global";
import getPreferredColorScheme from "Util/getPreferredColorScheme";

const switchPlatform = (platform) => {
	platform = platform || "web";
	const platforms = Object.seal({
		windows: "platform-win",
		osx: "platform-darwin",
		linux: "platform-linux"
	});
	const token = platforms[platform] || "platform-web";
	return (document.documentElement.classList.add(token), true);
};

const matchColorScheme = (callback = () => { }) => {
	const colorScheme = window.matchMedia('(prefers-color-scheme: dark)'); // Current web color scheme [browser]
	colorScheme.addEventListener('change', () => callback()); // Register new eventListener for colorScheme change [browser]
	return colorScheme.matches;
};

/**
 * Set color scheme to DOM
 * @param {String} colorScheme - color scheme
 */
const switchColorScheme = (colorScheme = null) => {
	const currentThemeMatch = document.documentElement.className.match(/(\w+)-theme/);
	const currentTheme = currentThemeMatch && currentThemeMatch[1];
	if (currentTheme !== colorScheme) {
		// console.debug("Setting theme", colorScheme);
		Object.entries({
			light: "light-theme",
			dark: "dark-theme",
		}).forEach(([key, value]) => {
			document.documentElement.classList[key == colorScheme ? "add" : "remove"](value);
		});
	}
};

/**
 * Update current color scheme
 */
const updateTheme = async () => {
	const userTheme = getState(global => global.theme);
	const theme = (userTheme == "system" ? getPreferredColorScheme() : userTheme);
	return (switchColorScheme(theme), true);
};
addCallback(updateTheme);

const updateThemeExperiments = async () => {
	const settings = getState(global => global.settings);
	document.documentElement.classList[settings.exp_more_border ? "add" : "remove"]("more-border");
};
addCallback(updateThemeExperiments);

const handleResize = () => {
	const token = "disable-animation";
	const removeSkipping = () => document.body.classList.remove(token);
	const debounceRemoveSkip = debounce(removeSkipping, 300, false);
	window.addEventListener("resize", () => {
		document.body.classList.add(token);
		debounceRemoveSkip();
	});
};

addReducer("init", () => {
	switchPlatform(window.system?.os);
	matchColorScheme(updateTheme);
	handleResize();
});

addReducer("openModal", (_global, _actions, payload) => {
	void addModal(payload);
});

addReducer("closeModal", (_global, _actions, _payload) => {
	void closeModal();
});

addReducer("onHideModal", (_global, _actions, _payload) => {
	void unloadModal();
});

addReducer("alert", (_global, _actions, update) => {
	if (!update) return;
	let { title, content, type, buttons, multiline, label } = update;
	void addModal({
		layer: "alert",
		title,
		content,
		type,
		buttons,
		multiline,
		label
	});
});

addReducer("openSettings", (global, _actions, update) => {
	if (global.modals.length > 0) return;
	const { tab } = update || {};
	return {
		...global,
		...(tab ? { currentSettingsScreen: tab } : {}),
		isSettingsOpen: true,
	};
});
addReducer("closeSettings", (global, _actions, _update) => {
	return {
		...global,
		isSettingsOpen: false,
	};
});

addReducer("openVersionChooserModal", (_global, _actions, _update) => {
	void addModal({
		layer: "versionChooser",
		label: "version-chooser",
		closeButton: true,
		allowOutsideClick: true,
	});
});
addReducer("openInstallationEditor", (_global, _actions, update) => {
	void addModal({
		layer: "installation-editor",
		label: "installation-editor",
		closeButton: false,
		allowOutsideClick: true,
		hash: update.hash,
	});
});

addReducer("openWhatsNewModal", (global, _actions, _update) => {
	void addModal({
		layer: "whats-new",
		label: "whats-new",
		small: true,
		closeButton: false,
	});
	global = getState(e => e);
	global = {
		...global,
		lastAppVersionId: APP_VERSION,
	};
	setState(global);
});

addReducer("openShortcutsModal", (_global, _actions, _update) => {
	void addModal({
		layer: "shortcuts-modal",
		label: "shortcuts-modal",
		closeButton: false,
		allowOutsideClick: true,
	});
});

addReducer("setTheme", (global, _actions, payload) => {
	return {
		...global,
		theme: payload
	};
});

addReducer("selectMainScreen", (global, _actions, payload) => {
	return {
		...global,
		currentMainScreen: payload
	};
});
addReducer("selectSettingsScreen", (global, _actions, payload) => {
	return {
		...global,
		currentSettingsScreen: payload
	};
});

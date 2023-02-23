import { addModal, closeModal, unloadModal } from "Model/Reducers/ui";
import { debounce } from "Util/Shedulers";
import { addCallback, addReducer, getState } from "Util/Store";
import getPreferredColorScheme from "Util/getPreferredColorScheme";

const switchPlatform = (platform) => {
	platform = platform || "web";
	const platforms = Object.seal({
		windows: "platform-win",
		osx: "platform-darwin",
		linux: "platform-linux"
	});
	const token = platforms[platform] || "platform-web";
	return document.documentElement.classList.toggle(token, true);
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
			document.documentElement.classList.toggle(value, key == colorScheme);
		});
	}
};

/**
 * Update current color scheme
 */
const updateTheme = async () => {
	const userTheme = getState(global => global.theme);
	const theme = (userTheme == "system" ? getPreferredColorScheme() : userTheme);
	switchColorScheme(theme);
};
addCallback(updateTheme);

const updateThemeExperiments = async () => {
	const settings = getState(global => global.settings);
	document.documentElement.classList.toggle("alt-settings", settings.exp_settings_blocks);
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

addReducer("init", (global) => {
	switchPlatform(window.system?.os);
	matchColorScheme(updateTheme);
	handleResize();
});

addReducer("openModal", (global, actions, payload) => {
	return addModal(global, payload);
});

addReducer("closeModal", (global, actions, payload) => {
	return closeModal(global, payload);
});

addReducer("onHideModal", (global, actions, payload) => {
	return unloadModal(global, payload);
});

addReducer("alert", (global, actions, update) => {
	if (!update) return;
	let { title, content, type, buttons, multiline } = update;
	actions.openModal({
		layer: "alert",
		title,
		content,
		type,
		buttons,
		multiline
	});
});

addReducer("openSettingsModal", (global, actions, update) => {
	const { tab } = update || {};
	actions.openModal({
		layer: "settings",
		label: "settings",
		closeButton: true,
		allowOutsideClick: true,
		tab,
	});
});

addReducer("openVersionChooserModal", (global, actions, update) => {
	actions.openModal({
		layer: "versionChooser",
		label: "version-chooser",
		closeButton: true,
		allowOutsideClick: true,
	});
});

addReducer("openWhatsNewModal", (global, actions, update) => {
	actions.openModal({
		layer: "whats-new",
		label: "whats-new",
		small: true,
		closeButton: false,
	});
});

addReducer("setTheme", (global, actions, payload) => {
	return {
		...global,
		theme: payload
	};
});

addReducer("selectMainScreen", (global, actions, payload) => {
	return {
		...global,
		currentMainScreen: payload
	};
});
addReducer("selectSettingsScreen", (global, actions, payload) => {
	return {
		...global,
		currentSettingsScreen: payload
	};
});

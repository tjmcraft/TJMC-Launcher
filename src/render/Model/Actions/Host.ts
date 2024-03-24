
import { updateConfiguration } from "Model/Reducers/configuration";
import { updateGameError, updateGameStartupError, updateHostInfo, updateProgress, updateStatus } from "Model/Reducers/host";
import { updateAuthState, updateConnectionState } from "Model/Reducers/initial";
import { updateInstallation } from "Model/Reducers/installations";

import { addReducer, getState } from "Store/Global";
import ProgressStore from "Store/Progress";
import { callHost, initHost } from "../../api/host";
import { updateCurrentUser } from "Model/Reducers/user";
import { selectInstallation } from "Model/Selectors/installations";

addReducer("initHost", (_global, actions) => {
	window.electron.on('tjmc:runAction', (_e, { type, data }) => {
		actions.runShortcutAction({ type, data });
	});
	void initHost(actions.hostUpdate);
});

addReducer("hostUpdate", (global, actions, update) => {
	window.__debug_host__ && console.debug(">>> HOST UPDATE:", update);
	switch (update.type) {
		case "updateConnectionState": return updateConnectionState(global, update);
		case "updateAuthState": return updateAuthState(global, update);
		// host auth
		case "updateCurrentUser": return updateCurrentUser(global, update);
		// host initial
		case "updateHostInfo": return updateHostInfo(global, update);
		case "updateConfiguration": return updateConfiguration(global, update);
		// game states
		case "updateGameStartupError": return updateGameStartupError(global, actions, update);
		case "updateGameError": return updateGameError(global, actions, update);
		// host updates
		case "updateStatus": return updateStatus(global, actions, update);
		case "updateProgress": return updateProgress(global, actions, update);
		default: return undefined;
	}
});

addReducer("relaunchHost", () => {
	void callHost("relaunchHost");
});

addReducer("requestAuth", (global, _actions, update) => {
	if (!update) return;
	const { login } = update;
	void callHost("requestAuth", login);
	return {
		...global,
		authIsLoading: Boolean(login),
	};
});

addReducer("logout", async (_global, _actions) => {
	try {
		await callHost("revokeAuth");
	} catch (e) { }
	// actions.reset();
});

addReducer("setConfig", async (_global, actions, payload) => {
	if (!payload) return;
	const { key, value } = payload;
	window.__debug__ && console.debug(">>", "[setConfig]", key, "=>", value);
	await callHost("setConfiguration", key, value);
	if (["launcher.disableHardwareAcceleration"].includes(key)) {
		actions.relaunchHost();
	}
});

addReducer("invokeLaunch", (global, actions, payload) => {

	if (!payload) return;
	const { hash, params } = payload;

	const current = selectInstallation(global, hash);
	if (current.isProcessing) return;

	if (params?.forceCheck && !params?.forceCheckAccepted) {
		return actions.alert({
			title: `Предупреждение`,
			content: `Вы уверены что хотите обновить версию? Будут обновлены все библиотеки и другие ресурсы.\nВ случае если вы вносили изменения в корневые файлы версии, то они будут потеряны!`,
			type: "warn",
			buttons: [
				{
					name: "Отмена",
					closeOverlay: true,
				},
				{
					name: "Продолжить",
					class: ["filled", "colorBrand"],
					closeOverlay: true,
					callback: () => actions.invokeLaunch(Object.assign({}, payload, { params: { ...payload.params, forceCheck: true, forceCheckAccepted: true } })),
				}
			],
			mini: true
		});
	}

	void callHost("invokeLaunch", hash, params);

	ProgressStore.setState({
		...ProgressStore.getState(),
		[hash]: { progress: 0 }
	});

	return updateInstallation(global, hash, {
		isProcessing: true
	});
});
addReducer("revokeLaunch", (global, _actions, payload) => {

	if (!payload) return;
	const { hash } = payload;

	void callHost("revokeLaunch", hash);

	return updateInstallation(global, hash, {
		isProcessing: false
	});
});

export const selectFolder = ({ title }) => callHost("selectFolder", { title });
export const selectFile = ({ title }) => callHost("selectFile", { title });

addReducer("updateCheck", () => void callHost("updateCheck"));
addReducer("updateDownload", () => void callHost("updateDownload"));
addReducer("updateInstall", () => void callHost("updateInstall"));

addReducer("openMinecraftFolder", () => void callHost("openMinecraftFolder"));
addReducer("openVersionsFolder", () => void callHost("openVersionsFolder"));
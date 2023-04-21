
import { updateConfiguration } from "Model/Reducers/configuration";
import { updateGameError, updateGameStartupError, updateHostInfo, updateProgress, updateStatus } from "Model/Reducers/host";
import { updateAuthState, updateConnectionState } from "Model/Reducers/initial";
import { updateInstallation } from "Model/Reducers/installations";

import { addReducer, getState } from "Store/Global";
import ProgressStore from "Store/Progress";
import { callHost, initHost } from "../../api/host";
import { updateCurrentUser } from "Model/Reducers/user";
import { selectCurrentVersionHash } from "Model/Selectors/installations";

addReducer("initHost", (global, actions) => {
	const withAuth = (fn = (...args) => args) => (...args) =>
		getState(global => ["ready"].includes(global.auth_state)) ? fn(...args) : () => void 0;
	const openSettings = (e, data) => actions.openSettingsModal();
	const runCurrentInstallation = (e, data) => {
		const hash = getState(selectCurrentVersionHash);
		return actions.invokeLaunch({ hash: hash });
	};
	const runInstallationForce = (e, data) => {
		const hash = getState(selectCurrentVersionHash);
		return actions.invokeLaunch({ hash: hash });
	};
	const editInstallation = (e, data) => {
		const hash = getState(selectCurrentVersionHash);
		return actions.openInstallationEditor({ hash: hash });
	};
	const createInstallation = (e, data) => {
		return actions.openVersionChooserModal();
	};
	electron.on('open-settings', withAuth(openSettings));
	electron.on('installation.run.current', withAuth(runCurrentInstallation));
	electron.on('installation.run.force', withAuth(runInstallationForce));
	electron.on('installation.edit.current', withAuth(editInstallation));
	electron.on('installation.create.new', withAuth(createInstallation));
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

addReducer("requestAuth", (global, actions, update) => {
	if (!update) return;
	const { login } = update;
	void callHost("requestAuth", login);
	return {
		...global,
		authIsLoading: Boolean(login),
	};
});

addReducer("logout", async (global, actions) => {
	try {
		await callHost("revokeAuth");
	} catch (e) { }
	// actions.reset();
});

addReducer("setConfig", async (global, actions, payload) => {
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
	const { hash } = payload;

	void callHost("invokeLaunch", hash);

	ProgressStore.setState({
		...ProgressStore.getState(),
		[hash]: { progress: 0 }
	});

	return updateInstallation(global, hash, {
		isProcessing: true
	});
});
addReducer("revokeLaunch", (global, actions, payload) => {

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
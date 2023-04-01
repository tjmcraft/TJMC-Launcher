
import { updateConfiguration } from "Model/Reducers/configuration";
import { updateGameError, updateGameStartupError, updateHostInfo, updateProgress, updateStatus } from "Model/Reducers/host";
import { updateConnectionState } from "Model/Reducers/initial";
import { updateInstallation } from "Model/Reducers/installations";

import { addReducer } from "Store/Global";
import ProgressStore from "Store/Progress";
import { callHost, initHost } from "../../api/host";
import { selectCurrentUser } from "Model/Selectors/user";

addReducer("initHost", (global, actions) => {
	void initHost(actions.hostUpdate);
});

addReducer("hostUpdate", (global, actions, update) => {
	window.__debug_host__ && console.debug(">>> HOST UPDATE:", update);
	switch (update.type) {
		case "updateConnectionState": return updateConnectionState(global, update);
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

	const currentUser = selectCurrentUser(global);
	const params = {
		auth: {
			username: currentUser.realname || currentUser.username,
			uuid: "",
			access_token: "",
			user_properties: {}
		}
	};

	void callHost("invokeLaunch", hash, params);

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
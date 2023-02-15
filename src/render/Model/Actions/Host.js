
import { updateConfiguration } from "Model/Reducers/configuration";
import { updateGameStartupSuccess, updateHostInfo } from "Model/Reducers/host";
import { updateConnectionState } from "Model/Reducers/initial";
import { updateInstallation } from "Model/Reducers/installations";

import { addReducer } from "Util/Store";
import { callHost, initHost } from "../../api/host";
import { selectCurrentUser } from "Model/Selectors/user";

addReducer("initHost", (global, actions) => {
	void initHost(actions.hostUpdate);
});

addReducer("hostUpdate", (global, actions, update) => {
	window.__debug_host__ && console.debug(">>> HOST UPDATE:", update);
	switch (update.type) {
		case "updateConnectionState": return updateConnectionState(global, update);
		case "updateHostInfo": return updateHostInfo(global, update);
		case "updateConfiguration": return updateConfiguration(global, update);
		case "updateGameStartupSuccess": return updateGameStartupSuccess(global, update);
		case "updateGameError":
		default: return undefined;
	}
});

addReducer("setConfig", (global, actions, payload) => {
	if (!payload) return;
	const { key, value } = payload;
	void callHost("setConfiguration", key, value);
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

	return updateInstallation(global, hash, {
		isProcessing: true
	});
});

addReducer("selectFolder", async (global, actions, payload) => {
	if (!payload) return;
	const { title } = payload;

	const result = await callHost("selectFolder", { title });
	console.debug(">>rs", result);
	return result;
});
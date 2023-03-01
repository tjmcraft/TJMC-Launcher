import { addReducer } from "Util/Store";
import { callHost } from "../../api/host";
import { updateInstallations, updateInstallationProgress } from "Model/Reducers/installations";
import { updateVersions } from "Model/Reducers/versions";

addReducer("hostUpdate", (global, actions, update) => {
	// console.debug(">>> HOST UPDATE:", update);
	switch (update.type) {
		case "updateInstallations": return updateInstallations(global, update);
		case "updateInstallationsProgressLoad": return updateInstallationProgress(global, update);
		case "updateInstallationsProgressDownload": return updateInstallationProgress(global, update);
		case "updateVersions": return updateVersions(global, update);
		default: return undefined;
	}
});

addReducer("createInstallation", async (global, actions, payload) => {
	if (!payload) return;
	let { version, options } = payload;
	options = Object.assign({}, {
		icon: undefined,
		name: version,
		lastVersionId: version,
		type: undefined,
		gameDir: undefined,
		javaPath: undefined,
		javaArgs: undefined,
		resolution: {
			width: 0,
			height: 0,
		},
	}, options);
	await callHost("createInstallation", options);
	actions.closeModal();
});

addReducer("removeInstallation", (global, actions, payload) => {
	if (!payload) return;
	let { hash, forceDeps } = payload;
	void callHost("removeInstallation", { hash, forceDeps });
});

addReducer("getGlobalVersions", () => {
	void callHost("fetchVersions");
});

addReducer("setVersionHash", (global, actions, payload) => {
	if (!payload) return;
	return {
		...global,
		version_hash: payload
	};
});
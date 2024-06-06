import { addReducer } from "Store/Global";
import { callHost } from "../../api/host";
import { updateInstallations, updateInstallationProgress, updateInstallationScreenshots, updateInstallationSaves } from "Model/Reducers/installations";
import { updateVersions } from "Model/Reducers/versions";
import { updateInstances } from "Model/Reducers/instances";
import { cleanObject } from "Util/Iterates";

addReducer("hostUpdate", (global, _actions, update) => {
	// console.debug(">>> HOST UPDATE:", update);
	switch (update.type) {
		case "updateInstallations": return updateInstallations(global, update);
		case "updateInstallationScreenshots": return updateInstallationScreenshots(global, update);
		case "updateInstallationSaves": return updateInstallationSaves(global, update);
		case "updateVersions": return updateVersions(global, update);
		case "updateInstances": return updateInstances(global, update);

		case "updateInstallationsProgressLoad": return updateInstallationProgress(global, update);
		default: return undefined;
	}
});

addReducer("createInstallation", async (_global, actions, payload) => {
	if (!payload) return;
	let { version, options } = payload;
	options = Object.assign({}, {
		lastVersionId: version,
	}, options);
	options = cleanObject(options);
	const { hash } = await callHost("createInstallation", options);
	hash && actions.setVersionHash(hash);
});
addReducer("fetchInstallationScreenshots", async (_global, actions, payload) => {
	if (!payload) return;
	await callHost("fetchInstallationScreenshots", payload);
});
addReducer("fetchInstallationSaves", async (_global, actions, payload) => {
	if (!payload) return;
	await callHost("fetchInstallationSaves", payload);
});
addReducer("editInstallation", async (_global, _actions, payload) => {
	if (!payload) return;
	let { hash, options } = payload;
	options = cleanObject(options);
	await callHost("editInstallation", hash, options);
});
addReducer("removeInstallation", (_global, _actions, payload) => {
	if (!payload) return;
	const { hash, forceDeps } = payload;
	void callHost("removeInstallation", { hash, forceDeps });
});

addReducer("openInstallationFolder", (_global, _actions, payload) => {
	if (!payload) return;
	const { hash } = payload;
	void callHost("openInstallationFolder", hash);
});

addReducer("killInstance", (_global, _actions, payload) => {
	if (!payload) return;
	void callHost("killInstance", { instanceId: payload });
});
addReducer("killAllInstances", (_global, _actions, _payload) => {
	void callHost("killAllInstances");
});
addReducer("openCubeLogs", (global, _actions, payload) => {
	if (!payload) return;
	return {
		...global,
		currentLogsHash: payload,
	};
});
addReducer("closeCubeLogs", (global, _actions, _update) => {
	return {
		...global,
		currentLogsHash: undefined,
	};
});

addReducer("getGlobalVersions", () => {
	void callHost("fetchVersions");
});

addReducer("setVersionHash", (_global, actions, payload) => {
	if (!payload) return;
	void actions.selectMainScreen({ type: 'installation', hash: payload });
});
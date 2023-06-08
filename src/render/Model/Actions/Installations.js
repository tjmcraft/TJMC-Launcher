import { addReducer } from "Store/Global";
import { callHost } from "../../api/host";
import { updateInstallations, updateInstallationProgress } from "Model/Reducers/installations";
import { updateVersions } from "Model/Reducers/versions";
import { updateInstances } from "Model/Reducers/instances";
import { cleanObject } from "Util/Iterates";

addReducer("hostUpdate", (global, actions, update) => {
	// console.debug(">>> HOST UPDATE:", update);
	switch (update.type) {
		case "updateInstallations": return updateInstallations(global, update);
		case "updateVersions": return updateVersions(global, update);
		case "updateInstances": return updateInstances(global, update);

		case "updateInstallationsProgressLoad": return updateInstallationProgress(global, update);
		default: return undefined;
	}
});

addReducer("createInstallation", async (global, actions, payload) => {
	if (!payload) return;
	let { version, options } = payload;
	options = Object.assign({}, {
		lastVersionId: version,
	}, options);
	options = cleanObject(options);
	const { hash } = await callHost("createInstallation", options);
	hash && actions.setVersionHash(hash);
});
addReducer("editInstallation", async (global, actions, payload) => {
	if (!payload) return;
	let { hash, options } = payload;
	options = cleanObject(options);
	await callHost("editInstallation", hash, options);
});

addReducer("removeInstallation", (global, actions, payload) => {
	if (!payload) return;
	let { hash, forceDeps } = payload;
	void callHost("removeInstallation", { hash, forceDeps });
});
addReducer("openInstallationFolder", (global, actions, payload) => {
	if (!payload) return;
	let { hash } = payload;
	void callHost("openInstallationFolder", hash);
});

addReducer("killInstance", (global, actions, payload) => {
	if (!payload) return;
	void callHost("killInstance", { instanceId: payload });
});
addReducer("killAllInstances", (global, actions, payload) => {
	void callHost("killAllInstances");
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
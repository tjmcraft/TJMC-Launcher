import { addReducer } from "Store/Global";
import { callHost } from "../../api/host";
import { updateInstallations, updateInstallationProgress } from "Model/Reducers/installations";
import { updateVersions } from "Model/Reducers/versions";
import { updateInstances } from "Model/Reducers/instances";
import { cleanObject } from "Util/Iterates";

addReducer("hostUpdate", (global, _actions, update) => {
	// console.debug(">>> HOST UPDATE:", update);
	switch (update.type) {
		case "updateInstallations": return updateInstallations(global, update);
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
addReducer("editInstallation", async (_global, _actions, payload) => {
	if (!payload) return;
	let { hash, options } = payload;
	options = cleanObject(options);
	await callHost("editInstallation", hash, options);
});
addReducer("removeInstallation", (_global, _actions, payload) => {
	if (!payload) return;
	let { hash, forceDeps } = payload;
	void callHost("removeInstallation", { hash, forceDeps });
});
addReducer("moveInstallationPosition", (_global, _actions, payload) => {
	if (!payload) return;
	let { startHash, endHash } = payload;
	void callHost("moveInstallationPosition", { startHash, endHash });
});

addReducer("openInstallationFolder", (_global, _actions, payload) => {
	if (!payload) return;
	let { hash } = payload;
	void callHost("openInstallationFolder", hash);
});

addReducer("killInstance", (_global, _actions, payload) => {
	if (!payload) return;
	void callHost("killInstance", { instanceId: payload });
});
addReducer("killAllInstances", (_global, _actions, _payload) => {
	void callHost("killAllInstances");
});

addReducer("getGlobalVersions", () => {
	void callHost("fetchVersions");
});

addReducer("setVersionHash", (global, _actions, payload) => {
	if (!payload) return;
	return {
		...global,
		version_hash: payload
	};
});
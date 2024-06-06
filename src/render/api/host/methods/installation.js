import { invokeRequest } from "./client";

let onUpdate;

export function init(_onUpdate) {
	onUpdate = _onUpdate;
}

export async function fetchInstallations() {
	let result;
	try {
		result = await invokeRequest({
			type: "fetchInstallations"
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	result.payload?.installations && onUpdate({
		type: "updateInstallations",
		installations: result.payload.installations,
	});
	return result.payload;
}

export async function fetchVersions() {
	let result;
	try {
		result = await invokeRequest({
			type: "fetchVersions"
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	result.payload?.versions && onUpdate({
		type: "updateVersions",
		versions: result.payload.versions,
	});
	return result.payload;
}

export async function createInstallation(options = {}) {
	let result;
	try {
		result = await invokeRequest({
			type: "createInstallation",
			data: options,
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	return result.payload;
}
export async function editInstallation(hash, installation = {}) {
	let result;
	try {
		result = await invokeRequest({
			type: "editInstallation",
			data: {
				hash, installation
			},
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	return result.payload;
}
export async function removeInstallation(options = {}) {
	let result;
	try {
		result = await invokeRequest({
			type: "removeInstallation",
			data: options,
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	return result.payload;
}
export async function openInstallationFolder(hash) {
	let result;
	try {
		result = await invokeRequest({
			type: "openInstallationFolder",
			data: { hash: hash },
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	return result.payload;
}
export async function openInstallationSavesFolder(hash) {
	let result;
	try {
		result = await invokeRequest({
			type: "openInstallationSavesFolder",
			data: { hash: hash },
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	return result.payload;
}
export async function openInstallationSaveFolder({ hash, name }) {
	let result;
	try {
		result = await invokeRequest({
			type: "openInstallationSaveFolder",
			data: { hash, name },
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	return result.payload;
}


export async function fetchInstallationScreenshots(name) {
	let result;
	try {
		result = await invokeRequest({
			type: "fetchInstallationScreenshots",
			data: { name: name },
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	result.payload?.screenshots && onUpdate({
		type: "updateInstallationScreenshots",
		screenshots: result.payload.screenshots,
		profile_name: result.payload.profile_name,
	});
	return result.payload;
}

export async function fetchInstallationSaves(name) {
	let result;
	try {
		result = await invokeRequest({
			type: "fetchInstallationSaves",
			data: { name: name },
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	result.payload?.saves && onUpdate({
		type: "updateInstallationSaves",
		saves: result.payload.saves,
		profile_name: result.payload.profile_name,
	});
	return result.payload;
}
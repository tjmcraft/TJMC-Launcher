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
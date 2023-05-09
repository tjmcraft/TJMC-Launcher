import { invokeRequest } from "./client";

let onUpdate;

export function init(_onUpdate) {
	onUpdate = _onUpdate;
}

export async function fetchHostInfo() {
	let result;
	try {
		result = await invokeRequest({
			type: "requestHostInfo"
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	result.payload && onUpdate({
		type: "updateHostInfo",
		hostInfo: result.payload,
	});
	return result.payload;
}
export async function relaunchHost() {
	let result;
	try {
		result = await invokeRequest({
			type: "relaunchHost"
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	return result.payload;
}

export async function openMinecraftFolder() {
	let result;
	try {
		result = await invokeRequest({
			type: "openMinecraftFolder"
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	return result.payload;
}
export async function openVersionsFolder() {
	let result;
	try {
		result = await invokeRequest({
			type: "openVersionsFolder"
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	return result.payload;
}

export async function selectFolder({ title }) {
	let result;
	try {
		result = await invokeRequest({
			type: "selectFolder",
			data: { title }
		}, false, true, true);
		if (!result?.payload) return undefined;
		result = result.payload;
	} catch (e) {
		return;
	}
	if (result.canceled) return undefined;
	console.debug("selectFolder", result);
	return result.filePaths;
}
export async function selectFile({ title }) {
	let result;
	try {
		result = await invokeRequest({
			type: "selectFile",
			data: { title }
		}, false, true, true);
		if (!result?.payload) return undefined;
		result = result.payload;
	} catch (e) {
		return;
	}
	if (result.canceled) return undefined;
	console.debug("selectFile", result);
	return result.filePaths;
}

export async function updateCheck() {
	let result;
	try {
		result = await invokeRequest({
			type: "updateCheck",
		}, false, true, true);
		if (!result?.payload) return undefined;
		result = result.payload;
	} catch (e) {
		return;
	}
	return result;
}
export async function updateDownload() {
	let result;
	try {
		result = await invokeRequest({
			type: "updateDownload",
		}, false, true, true);
		if (!result?.payload) return undefined;
		result = result.payload;
	} catch (e) {
		return;
	}
	return result;
}
export async function updateInstall() {
	let result;
	try {
		result = await invokeRequest({
			type: "updateInstall",
			data: { isSilent: true, isForceRunAfter: true }
		}, false, true, true);
		if (!result?.payload) return undefined;
		result = result.payload;
	} catch (e) {
		return;
	}
	return result;
}
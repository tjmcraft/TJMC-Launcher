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

export async function invokeLaunch(version_hash, params = {}) {
	let result;
	try {
		result = await invokeRequest({
			type: "invokeLaunch",
			data: {
				version_hash, params
			}
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	return result.payload;
}

export async function fetchConfiguration() {
	let result;
	try {
		result = await invokeRequest({
			type: "fetchConfiguration"
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	result.payload?.configuration && onUpdate({
		type: "updateConfiguration",
		configuration: result.payload.configuration,
	});
	return result.payload;
}

export async function setConfiguration(key, value) {
	try {
		result = await invokeRequest({
			type: "setConfiguration",
			data: { key, value },
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	return result.payload;
}
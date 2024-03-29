import { invokeRequest } from "./client";

let onUpdate;

export function init(_onUpdate) {
	onUpdate = _onUpdate;
}

export async function fetchInstances() {
	let result;
	try {
		result = await invokeRequest({
			type: "fetchInstances"
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	result.payload?.instances && onUpdate({
		type: "updateInstances",
		instances: result.payload.instances,
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
export async function revokeLaunch(version_hash) {
	let result;
	try {
		result = await invokeRequest({
			type: "revokeLaunch",
			data: {
				version_hash
			}
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	return result.payload;
}

export async function killInstance(options = {}) {
	let result;
	try {
		result = await invokeRequest({
			type: "killInstance",
			data: options,
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	return result.payload;
}
export async function killAllInstances() {
	let result;
	try {
		result = await invokeRequest({
			type: "killAllInstances",
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result) return undefined;
	return result.payload;
}
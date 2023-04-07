import { invokeRequest } from "./client";

let onUpdate;

export function init(_onUpdate) {
	onUpdate = _onUpdate;
}

export async function requestAuth(username) {
	let result;
	try {
		result = await invokeRequest({
			type: "auth:requestAuth",
			data: { username }
		}, false, true, true);
	} catch (e) {
		return;
	}
	return result.payload;
}

export async function revokeAuth() {
	let result;
	try {
		result = await invokeRequest({
			type: "auth:revokeAuth",
		}, false, true, true);
	} catch (e) {
		return;
	}
	if (!result.payload) return undefined;
	const { code } = result.payload;
	if (code == 1) {
		onUpdate({
			type: "updateAuthState",
			auth_state: "need_auth",
		});
		return;
	}
	return false;
}

export async function fetchCurrentUser() {
	let result;
	try {
		result = await invokeRequest({
			type: "auth:fetchCurrentUser"
		}, false, true, true);
	} catch (e) {
		return;
	}
	const user = result.payload.user;
	onUpdate({
		type: "updateCurrentUser",
		user: user,
	});
	return user;
}
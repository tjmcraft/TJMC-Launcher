import { invokeRequest } from "./client";

let onUpdate;

export function init(_onUpdate) {
	onUpdate = _onUpdate;
}

export async function requestAuth(username, password) {
	username = username.toLowerCase();
	let result;
	try {
		result = await invokeRequest({
			type: "auth:requestAuth",
			data: {
				username,
				password,
			}
		}, false, true, true);
		if (result.payload.error) {
			onUpdate({
				type: "updateAuthError",
				authError: result.payload.error,
			});
			return undefined;
		}
	} catch (e) {
		return;
	}
	if (!result.payload) return undefined;
	const user = result.payload.user;
	if (!user.id) {
		onUpdate({
			type: "updateAuthState",
			auth_state: "need_auth",
		});
		return;
	}
	void fetchCurrentUser();
	return user;
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
	if (!result.payload?.user) {
		onUpdate({
			type: "updateAuthState",
			auth_state: "need_auth"
		});
		return false;
	}
	const user = result.payload.user;
	onUpdate({
		type: "updateCurrentUser",
		currentUser: user,
	});
	onUpdate({
		type: "updateAuthState",
		auth_state: "ready"
	});
	return user;
}
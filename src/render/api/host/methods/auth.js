import { invokeRequest } from "./client";

let onUpdate;

export function init(_onUpdate) {
	onUpdate = _onUpdate;
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
	if (!result || !result.payload) {
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
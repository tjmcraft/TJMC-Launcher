import { fetchData, postData } from "Util/Fetch";

let onUpdate;

export function init(_onUpdate) {
	onUpdate = _onUpdate;
}

export async function loginUser(username, password) {
	username = username.toLowerCase();
	let result;
	try {
		result = await postData(API_URL + "/api/auth/login", {}, {
			login: username,
			password
		});
		if (result.error) {
			onUpdate({
				type: "updateAuthError",
				authError: result.error,
			});
			return undefined;
		}
	} catch (e) {
		return;
	}
	if (!result.response) return undefined;
	const user = result.response.user;
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

export async function logoutUser() {
	let result;
	try {
		result = await postData(API_URL + "/api/auth/logout");
		if (result.error) {
			onUpdate({
				type: "updateAuthError",
				authError: result.error,
			});
			return undefined;
		}
	} catch (e) {
		return;
	}
	if (!result.response) return undefined;
	const { code } = result.response;
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
		result = await fetchData(API_URL + "/api/auth/get");
		if (result.error) {
			if (result.status == 400) {
				onUpdate({
					type: "updateAuthState",
					auth_state: "need_auth"
				});
			}
			return false;
		}
	} catch (e) {
		return;
	}
	if (!result.response) return undefined;
	const user = result.response.user;
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
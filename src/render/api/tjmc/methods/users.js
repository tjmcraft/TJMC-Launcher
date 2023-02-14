import { fetchData } from "Util/Fetch";

let onUpdate;

export function init(_onUpdate) {
	onUpdate = _onUpdate;
}

export async function fetchUser({ id }) {
	let result;
	try {
		result = await fetchData(API_URL + "/api/users/get", { id });
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
		type: "updateUser",
		id: user.id,
		user,
	});
	return user;
}
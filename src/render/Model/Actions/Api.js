import { callApi, initApi } from "../../api/tjmc";
import { updateAuthError, updateAuthState } from "Model/Reducers/initial";
import { updateCurrentUser, updateUser } from "Model/Reducers/user";
import { addReducer } from "Util/Store";
import { updateReleases } from "Model/Reducers/settings";

addReducer("initApi", (global, actions) => {
	void initApi(actions.apiUpdate);
});

addReducer("apiUpdate", (global, actions, update) => {
	window.__debug_api__ && console.debug(">>> API UPDATE:", update);
	switch (update.type) {
		case "updateAuthState": return updateAuthState(global, update);
		case "updateAuthError": return updateAuthError(global, update.authError);
		case "updateUser": return updateUser(global, update.id, update.user);
		case "updateCurrentUser": return updateCurrentUser(global, update);
		case "updateReleases": return updateReleases(global, update);
		default: return undefined;
	}
});

addReducer("requestAuth", (global, actions, update) => {
	if (!update) return;
	const { login, password } = update;
	if (!login || !password) return;
	void callApi("loginUser", login, password);
	return {
		...global,
		authIsLoading: true,
	};
});

addReducer("logout", async (global, actions) => {
	try {
		await callApi("logoutUser");
	} catch (e) { }
	actions.reset();
});
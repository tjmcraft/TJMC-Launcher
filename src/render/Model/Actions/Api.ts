import { initApi } from "../../api/tjmc";
import { updateUser } from "Model/Reducers/user";
import { addReducer } from "Store/Global";
import { updateReleases } from "Model/Reducers/settings";

addReducer("initApi", (_global, actions) => {
	void initApi(actions.apiUpdate);
});

addReducer("apiUpdate", (global, _actions, update) => {
	window.__debug_api__ && console.debug(">>> API UPDATE:", update);
	switch (update.type) {
		case "updateUser": return updateUser(global, update.id, update.user);
		case "updateReleases": return updateReleases(global, update);
		default: return undefined;
	}
});
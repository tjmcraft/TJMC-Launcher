import { addReducer } from "Store/Global";
import { updateUpdate } from "Model/Reducers/host";

addReducer("setSettings", (global, _actions, payload) => {
	window.__debug__ && console.debug(">>", "[setSettings]", payload);
	return {
		...global,
		settings: {
			...global.settings,
			...payload
		}
	};
});

addReducer("setUpdatePopupLock", (global, _actions, payload) => {
	return updateUpdate(global, {
		popupLock: Boolean(payload)
	});
});
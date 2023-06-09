import { addReducer } from "Store/Global";

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
	return {
		...global,
		update: {
			popupLock: Boolean(payload)
		},
	};
});
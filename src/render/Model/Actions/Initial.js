import { addReducer } from "Store/Global";

addReducer("setSettings", (global, actions, payload) => {
	window.__debug__ && console.debug(">>", "[setSettings]", payload);
	return {
		...global,
		settings: {
			...global.settings,
			...payload
		}
	};
});
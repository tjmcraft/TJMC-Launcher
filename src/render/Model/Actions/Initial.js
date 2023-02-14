import { addReducer } from "Util/Store";

addReducer("setSettings", (global, actions, payload) => {
	return {
		...global,
		settings: {
			...global.settings,
			...payload
		}
	};
});
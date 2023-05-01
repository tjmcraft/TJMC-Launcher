import { StateStore, StoreCaching } from "Util/Store";

const INITIAL_STATE = {
	currentUserId: undefined,
	version_hash: undefined,
	theme: "system",
	auth_state: "pending",
	hostConnectionState: "connectionStateBroken",
	hostInfo: {
		hostVendor: undefined,
		hostVersion: undefined,
	},
	settings: {
		debug_mode: false,
		debug_host: false,
		debug_api: false,
		enable_preloader: true,
		full_settings: false,
		full_chooser: false,
		dev_disable_faloc: false,
	},
	users: {},
	installations: {},
	instances: {},
	versions: [],
	modals: [],
	configuration: undefined,
	releases: [],
	currentMainScreen: "cube",
	currentSettingsScreen: "my-account",
	lastAppVersionId: undefined,
	update: {
		status: "not-available",
		progress: 0,
		next: undefined,
	}
};

const stateStore = new StateStore();
const { loadCache, resetCache } = StoreCaching(stateStore, INITIAL_STATE);

stateStore.addCallback(async (global) => {
	window.__debug__ && console.debug("->", { ...global });
});

stateStore.addReducer("init", () => {
	const initial = Object.assign({}, INITIAL_STATE);
	const state = loadCache(initial) || initial;
	return state;
});

stateStore.addReducer("reset", resetCache);

window.resetCache = stateStore.getDispatch().reset;
window._gstore = stateStore;

export const getDispatch = stateStore.getDispatch;
export const getState = stateStore.getState;
export const setState = stateStore.setState;
export const withState = stateStore.withState;
export const addReducer = stateStore.addReducer;
export const addCallback = stateStore.addCallback;
export const removeCallback = stateStore.removeCallback;
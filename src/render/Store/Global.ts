import { StateStore, StoreCaching } from "Util/Store";

export type GlobalState = {
	currentUserId?: string;
	version_hash?: string;
	theme: string;
	auth_state: string;
	hostConnectionState: string;
	hostInfo: {
		hostVendor: AnyLiteral;
		hostVersion: AnyLiteral;
		hostMemory: any;
		hostMenu: any;
	};
	settings: {
		debug_mode: boolean;
		debug_host: boolean;
		debug_api: boolean;
		enable_preloader: boolean;
		full_settings: boolean;
		full_chooser: boolean;
		dev_disable_faloc: boolean;
		exp_more_border: boolean;
	};
	users: Record<string, AnyLiteral>;
	installations: Record<string, AnyLiteral>;
	instances: Record<string, AnyLiteral>;
	versions: Array<any>;
	modals: Array<{
		isShown: boolean;
		label: string;
		layer: string;
		props: AnyLiteral;
	}>;
	configuration?: AnyLiteral;
	releases: Array<any>;
	currentMainScreen: string;
	currentSettingsScreen: string;
	lastAppVersionId?: string;
	update: {
		popupLock: boolean;
		status: string;
		progress: number;
		next?: AnyLiteral;
		total?: number;
		transferred?: number;
		bytesPerSecond?: number;
	};
};

const INITIAL_STATE: GlobalState = {
	currentUserId: undefined,
	version_hash: undefined,
	theme: "system",
	auth_state: "pending",
	hostConnectionState: "connectionStateBroken",
	hostInfo: {
		hostVendor: undefined,
		hostVersion: undefined,
		hostMemory: undefined,
		hostMenu: undefined,
	},
	settings: {
		debug_mode: false,
		debug_host: false,
		debug_api: false,
		enable_preloader: true,
		full_settings: false,
		full_chooser: false,
		dev_disable_faloc: false,
		exp_more_border: false,
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
		popupLock: false,
	}
};

export type MapStateToProps<T extends AnyFunction, OwnProps = undefined> = (global: GlobalState, ownProps?: OwnProps) => ReturnType<T>;

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
export const getState = <T extends MapStateToProps<T>>(selector?: T): ReturnType<T> => stateStore.getState(selector);
export const setState = stateStore.setState;
export const withState = stateStore.withState;
export const addReducer = stateStore.addReducer;
export const addCallback = stateStore.addCallback;
export const removeCallback = stateStore.removeCallback;
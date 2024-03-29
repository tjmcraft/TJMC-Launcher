import { StateStore, StoreCaching } from "Util/Store";

type ActionNames = string;
type ActionPayload = any;

interface ActionOptions {
	silent?: boolean;
}
type Actions = Record<ActionNames, (payload?: ActionPayload, options?: ActionOptions) => void>;

export type GlobalState = {
	currentUserId?: string;
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
		dev_disable_faloc: boolean;
		exp_more_border: boolean;
	};
	users: Record<string, AnyLiteral>;
	installations: Record<string, HostInstallation>;
	instances: Record<string, AnyLiteral>;
	versions: Array<Version>;
	modals: Array<{
		isShown: boolean;
		isClosing: boolean;
		label: string;
		layer: string;
		props: AnyLiteral;
	}>;
	configuration?: HostConfig;
	releases: Array<any>;
	currentMainScreen: {
		type: 'installation';
		hash: string;
	} | {
		type: 'map';
	};
	currentLogsHash?: string;
	currentSettingsScreen: string;
	isSettingsOpen: boolean;
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
	currentMainScreen: {
		type: 'installation',
		hash: undefined,
	},
	currentLogsHash: undefined,
	currentSettingsScreen: "my-account",
	isSettingsOpen: false,
	lastAppVersionId: undefined,
	update: {
		status: "not-available",
		progress: 0,
		next: undefined,
		popupLock: false,
	}
};

type ActionHandler = (
  global: GlobalState,
  actions: Actions,
  payload: any,
) => GlobalState | void | Promise<void>;

export type MapStateToProps<T extends AnyFunction, OwnProps = AnyLiteral> = (global: GlobalState, ownProps?: OwnProps) => ReturnType<T>;

const stateStore = new StateStore();
const { loadCache, resetCache } = StoreCaching(stateStore, INITIAL_STATE, [
	"currentUserId",
	"theme",
	"auth_state",
	"settings",
	"users",
	"installations",
	"versions",
	"releases",
	"currentMainScreen",
	"currentSettingsScreen",
	"isSettingsOpen",
	"lastAppVersionId",
]);

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
export const getState =
	<T extends MapStateToProps<T>>(selector: T): ReturnType<T> => stateStore.getState(selector);
export const setState = stateStore.setState;
export const withState = stateStore.withState;
export const addReducer: (name: ActionNames, reducer: ActionHandler) => void =
	(...args) => stateStore.addReducer(...args);
export const removeReducer: (name: ActionNames, reducer: ActionHandler) => void =
	(...args) => stateStore.removeReducer(...args);
export const addCallback = stateStore.addCallback;
export const removeCallback = stateStore.removeCallback;
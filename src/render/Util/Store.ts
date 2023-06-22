import { pick, shallowEqual } from "./Iterates";
import { generateIdFor } from "./Random";
import { onBeforeUnload, throttle } from "./Shedulers";

type GlobalState = AnyLiteral;
type ActionNames = string;
type ActionPayload = any;

interface ActionOptions {
	silent?: boolean;
}
type Actions = Record<ActionNames, (payload?: ActionPayload, options?: ActionOptions) => void>;

type ActionHandler = (
  global: GlobalState,
  actions: Actions,
  payload: any,
) => GlobalState | void | Promise<void>;

type MapStateToProps<OwnProps = undefined> = (global: GlobalState, ownProps?: OwnProps) => any;

export class StateStore {

	private currentState: GlobalState = {};

	private reducers: Record<string, ActionHandler[]> = {};
	private actions: Actions = {};
	private containers: Map<string, {
		selector: MapStateToProps<any>;
		ownProps?: AnyLiteral;
		mappedProps?: AnyLiteral;
		callback: Function;
		debug?: any;
	}> = new Map();

	setState = (state = null, options = null) => {
		if (typeof state === "object" && state !== this.currentState) {
			this.currentState = state;
			if (options?.silent) return; // if silent -> no callbacks
			this.runCallbacks();
		}
	};

	getState = (selector: MapStateToProps<any> = (state) => (state)) => selector(this.currentState) ?? undefined;


	private updateContainers = (currentState) => {
		for (const container of this.containers.values()) {
			const { selector, ownProps, mappedProps, callback } = container;

			let newMappedProps;

			try {
				newMappedProps = selector(currentState, ownProps);
			} catch (err) {
				console.error(">> GSTATE", "CONTAINER\n", "UPDATE",
					"Чёт наебнулось, но всем как-то похуй, да?\n",
					"Может трейс глянешь хоть:\n", err);
				return;
			}

			if (Object.keys(newMappedProps).length && !shallowEqual(mappedProps, newMappedProps)) {
				container.mappedProps = newMappedProps;
				callback(container.mappedProps);
			}
		}
	}

	private callbacks: Function[] = [this.updateContainers];

	addCallback = (cb: Function) => {
		if (typeof cb === "function") {
			this.callbacks.push(cb);
		}
	};

	removeCallback = (cb: Function) => {
		const index = this.callbacks.indexOf(cb);
		if (index !== -1) {
			this.callbacks.splice(index, 1);
		}
	};

	private runCallbacks = () => {
		//console.debug("run callbacks", callbacks)
		this.callbacks.forEach((cb) => typeof cb === "function" ? cb(this.currentState) : null);
	};

	private onDispatch = (name: string, payload?: ActionPayload, options?: ActionOptions) => {
		if (this.reducers[name]) { // if reducers for this name exists
			this.reducers[name].forEach((reducer) => {
				const response = reducer(this.currentState, this.actions, payload);
				if (!response || typeof response.then === "function") {
					return response;
				}
				this.setState(response, options);
			});
		}
	};

	addReducer = (name: ActionNames, reducer: ActionHandler) => {
		if (!this.reducers[name]) { // if no reducers for this name
			this.reducers[name] = []; // create empty
			this.actions[name] = (payload?: ActionPayload, options?: ActionOptions) => // add dispatch action
				this.onDispatch(name, payload, options);
		}
		this.reducers[name].push(reducer);
	};

	getDispatch = () => this.actions;

	withState = <OwnProps>(
		selector: MapStateToProps<OwnProps> = () => ({}),
		debug?: any
	) => {
		return (callback: Function) => {
			const id = generateIdFor(this.containers);
			let container = this.containers.get(id);
			if (!container) {
				container = {
					selector,
					callback,
					mappedProps: undefined,
					debug: debug || id,
				};
				this.containers.set(id, container);
			}
			if (!container.mappedProps) {
				try {
					container.mappedProps = selector(this.currentState);
				} catch (err) {
					console.error(">> GSTATE", "CONTAINER\n", "INITIAL UPDATE",
						"Чёт наебнулось в первый раз, но всем как-то похуй, да?\n",
						"Может трейс глянешь хоть:\n", err);
					return;
				}
			}
			callback(container.mappedProps);
			return () => {
				console.debug("[withState]", "{GC}", "container", "->", id);
				this.containers.delete(id);
			};
		};
	};

}

export const StoreCaching = (store: StateStore, initialState: {}, cache_key: string = null) => {

	if (typeof store != "object" || !(store instanceof StateStore)) throw new Error("Caching store in not instance of StateStore");

	const STATE_CACHE_KEY = cache_key || "tjmc.global.state";
	const INITIAL_STATE = initialState || {};
	const UPDATE_THROTTLE = 5000;

	const updateCacheThrottled = throttle(() => updateCache(), UPDATE_THROTTLE, false);
	let unsubscribeFromBeforeUnload;
	let isCaching = true;

	const setupCaching = () => {
		isCaching = true;
		unsubscribeFromBeforeUnload = onBeforeUnload(updateCache, true);
		window.addEventListener("blur", updateCache);
		store.addCallback(updateCacheThrottled);
	};

	const clearCaching = () => {
		isCaching = false;
		store.removeCallback(updateCacheThrottled);
		window.removeEventListener("blur", updateCache);
		if (unsubscribeFromBeforeUnload) {
			unsubscribeFromBeforeUnload();
		}
		window.location.reload();
	};

	const resetCache = () => {
		localStorage.removeItem(STATE_CACHE_KEY);
		if (!isCaching) return;
		clearCaching();
	};

	const loadCache = (initialState) => {
		setupCaching();
		return readCache(initialState);
	};

	const readCache = (initialState) => {
		const json = localStorage.getItem(STATE_CACHE_KEY);
		const cached = json ? JSON.parse(json) : undefined;
		const newState = {
			...initialState,
			...cached,
		};
		return {
			...newState
		};
	};

	const updateCache = () => {
		if (!isCaching) {
			return;
		}
		const global = store.getState();
		const reducedGlobal = {
			...INITIAL_STATE,
			...pick(global, [
				"currentUserId",
				"version_hash",
				"theme",
				"auth_state",
				"settings",
				"users",
				"installations",
				"versions",
				"releases",
				"currentMainScreen",
				...(APP_ENV == "development" ? [
					"currentSettingsScreen", "modals"
				] : []),
				"lastAppVersionId"
			])
		};
		try {
			const json = JSON.stringify(reducedGlobal);
			localStorage.setItem(STATE_CACHE_KEY, json);
		} catch (e) {
			console.warn(e, reducedGlobal);
		}
	};

	return { loadCache, resetCache };

};

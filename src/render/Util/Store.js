import { createElement, useState, useEffect } from "react";
import { pick, shallowEqual } from "./Iterates";
import { generateIdFor } from "./Random";
import { onBeforeUnload, throttle } from "./Shedulers";
import useForceUpdate from "Hooks/useForceUpdate";

function StateStore() {

	const debug_picker = false;
	const debug_container = false;

	let currentState = {};

	this.setState = (state = null, options = null) => {
		if (typeof state === "object" && state !== currentState) {
			currentState = state;
			if (options?.silent) return; // if silent -> no callbacks
			runCallbacks();
		}
	};

	this.getState = (selector = (state) => state) => selector({ ...currentState }) ?? undefined;

	const callbacks = [updateContainers];

	this.addCallback = (cb = () => { }) => {
		if (typeof cb === "function") {
			callbacks.push(cb);
		}
	};

	this.removeCallback = (cb = () => { }) => {
		const index = callbacks.indexOf(cb);
		if (index !== -1) {
			callbacks.splice(index, 1);
		}
	};

	const runCallbacks = () => {
		//console.debug("run callbacks", callbacks)
		callbacks.forEach((cb) => typeof cb === "function" ? cb({ ...currentState }) : null);
	};

	const reducers = {};
	const actions = {};

	const onDispatch = (name, payload = null, options = null) => {
		if (reducers[name]) { // if reducers for this name exists
			reducers[name].forEach((reducer) => {
				const response = reducer(currentState, actions, payload);
				if (!response || typeof response.then === "function") {
					return response;
				}
				this.setState(response, options);
			});
		}
	};

	this.addReducer = (name, reducer) => {
		if (!reducers[name]) { // if no reducers for this name
			reducers[name] = []; // create empty
			actions[name] = (payload = null, options = null) => // add dispatch action
				onDispatch(name, payload, options);
		}
		reducers[name].push(reducer);
	};

	this.getDispatch = () => actions;

	const containers = new Map();

	window._gsm_containers = containers;

	function updateContainers(currentState) {
		for (const container of containers.values()) {
			const { selector, ownProps, mappedProps, callback } = container;

			// debug_container && console.debug("[updateContainer]", "->", container.debug, "=>\n", { ...container });

			let newMappedProps;

			try {
				newMappedProps = selector(currentState, ownProps);
			} catch (err) {
				console.error(">> GSTATE", "CONTAINER\n", "UPDATE",
					"Чёт наебнулось, но всем как-то похуй, да?\n",
					"Может трейс глянешь хоть:\n", err);
				return;
			}

			debug_picker && console.debug("[pick]", "->", container.debug, "=>\n", mappedProps, "->", newMappedProps);

			if (Object.keys(newMappedProps).length && !shallowEqual(mappedProps, newMappedProps)) {
				debug_picker && console.debug("[picked]", "->", container.debug, "=>\n", mappedProps, "->", newMappedProps);
				container.mappedProps = newMappedProps;
				callback(container.mappedProps);
			}
		}
	}

	this.withState = (selector = void 0, debug = undefined) => {
		return (callback = void 0) => {
			const id = generateIdFor(containers);
			let container = containers.get(id);
			if (!container) {
				container = {
					selector,
					callback,
					mappedProps: undefined,
					debug: debug || id,
				};
				containers.set(id, container);
			}
			if (!container.mappedProps) {
				try {
					container.mappedProps = selector(currentState);
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
				containers.delete(id);
			};
		};
	};

	this.stateComponent = (selector = void 0, debug = undefined) => {
		return (Component) => {
			return function TCContainer(props) {

				const [id] = useState(generateIdFor(containers));
				const forceUpdate = useForceUpdate();

				useEffect(() => {
					return () => {
						console.debug("[stateComponent]", "Deleting container", debug, "...");
						containers.delete(id);
					};
				}, [id]);

				let container = containers.get(id);
				if (!container) {
					container = {
						selector,
						callback: forceUpdate,
						ownProps: props,
						mappedProps: undefined,
						debug: debug || id,
					};
					containers.set(id, container);
				}

				if (!container.mappedProps || !shallowEqual(container.ownProps, props)) {
					container.ownProps = props;
					try {
						container.mappedProps = selector(currentState, props);
					} catch (err) {
						return;
					}
				}

				debug_container && console.debug("[stateComponent]", "{SS}", "container", "->", debug);

				return createElement(Component, { ...container.mappedProps });
			};
		};
	};

	return this;

}


/**
 * StateStore Caching
 * @param {StateStore} store - state store instance
 * @param {Object} initialState - initial state
 * @param {String} cache_key - state cache key for localStorage
 * @returns
 */
const StoreCaching = (store, initialState, cache_key = null) => {

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
				] : [])
			])
		};
		const json = JSON.stringify(reducedGlobal);
		localStorage.setItem(STATE_CACHE_KEY, json);
	};

	return { loadCache, resetCache };

};


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
		exp_settings_blocks: false,
		dev_disable_faloc: false,
	},
	users: {},
	installations: {},
	versions: [],
	modals: [],
	configuration: undefined,
	releases: [],
	currentMainScreen: "home",
	currentSettingsScreen: "my-account"
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
export const withState = stateStore.withState;
export const stateComponent = stateStore.stateComponent;
export const addReducer = stateStore.addReducer;
export const addCallback = stateStore.addCallback;
export const removeCallback = stateStore.removeCallback;
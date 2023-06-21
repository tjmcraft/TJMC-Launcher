import {  pick, shallowEqual } from "./Iterates";
import { generateIdFor } from "./Random";
import { onBeforeUnload, throttle } from "./Shedulers";

export function StateStore() {

	let currentState = {};

	this.setState = (state = null, options = null) => {
		if (typeof state === "object" && state !== currentState) {
			currentState = state;
			if (options?.silent) return; // if silent -> no callbacks
			runCallbacks();
		}
	};

	this.getState = (selector = (state) => state) => selector(currentState) ?? undefined;

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
		callbacks.forEach((cb) => typeof cb === "function" ? cb(currentState) : null);
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

	function updateContainers(currentState) {
		for (const container of containers.values()) {
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

	return this;

}


/**
 * StateStore Caching
 * @param {StateStore} store - state store instance
 * @param {Object} initialState - initial state
 * @param {String} cache_key - state cache key for localStorage
 * @returns
 */
export const StoreCaching = (store, initialState, cache_key = null) => {

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

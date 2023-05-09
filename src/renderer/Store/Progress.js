import { StateStore } from "Util/Store";

const INITIAL_STATE = {

};

const stateStore = new StateStore();

stateStore.addCallback(async (global) => {
	window.__debug__ && console.debug("->", { ...global });
});

stateStore.addReducer("init", () => {
	return Object.assign({}, INITIAL_STATE);
});

export const getState = stateStore.getState;
export const setState = stateStore.setState;
export const addReducer = stateStore.addReducer;
export const addCallback = stateStore.addCallback;
export const removeCallback = stateStore.removeCallback;

export default {
	getState, setState, addReducer, addCallback, removeCallback
};
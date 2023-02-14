import { init as initUsers } from "./methods/users";
import { fetchCurrentUser, init as initAuth } from "./methods/auth";
import { fetchReleases, init as initUpdates } from "./methods/updates";
import * as methods from './methods';

let onUpdate;

export async function initApi(_onUpdate, initialArgs) {
	onUpdate = _onUpdate;

	initUsers(onUpdate);
	initAuth(onUpdate);
	initUpdates(onUpdate);

	void fetchCurrentUser();
	void fetchReleases();
}

export function callApi(fnName, ...args) {
	return methods[fnName](...args);
}
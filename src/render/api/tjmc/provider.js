import { fetchReleases, init as initUpdates } from "./methods/updates";
import * as methods from './methods';

let onUpdate;

export async function initApi(_onUpdate, initialArgs) {
	onUpdate = _onUpdate;

	initUpdates(onUpdate);

	void fetchReleases();
}

export function callApi(fnName, ...args) {
	return methods[fnName](...args);
}
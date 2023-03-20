import { init as initClient } from "./methods/client";
import { init as initInstallations } from "./methods/installation";
import { init as initInstances } from "./methods/instances";
import { init as initHostex } from "./methods/host";

import { init as initUpdater } from "./updater";
import * as methods from './methods';

let onUpdate;

export async function initHost(_onUpdate, initialArgs) {
	onUpdate = _onUpdate;

	initUpdater(onUpdate);
	initHostex(onUpdate);
	initInstallations(onUpdate);
	initInstances(onUpdate);

	await initClient(onUpdate, initialArgs);
}

export function callHost(fnName, ...args) {
	return methods[fnName](...args);
}
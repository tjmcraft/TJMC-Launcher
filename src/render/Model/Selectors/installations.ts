import { GlobalState } from "Store/Global";

export function selectCurrentVersionHash(global) {
	return global.currentMainScreen?.hash || undefined;
}

export function selectInstallations(global) {
	return global.installations || {};
}

export function selectInstallation(global: GlobalState, versionHash: string): HostInstallationWithHash {
	if (global.installations && Object(global.installations).hasOwnProperty(versionHash)) {
		return { hash: versionHash, ...global.installations[versionHash] };
	}
	return undefined;
}

export function selectVersions(global: GlobalState, type: VersionType | undefined) {
	return global.versions?.filter((version) => type === undefined ? true : version.type == type) || [];
}


export function selectInstances(global) {
	return global.instances || {};
}

export function selectInstance(global, instanceId) {
	if (global.instances && Object(global.instances).hasOwnProperty(instanceId)) {
		return { ...global.instances[instanceId] };
	}
	return undefined;
}

export function selectScreenshots(global, hash) {
	if (global.screenshotsByInstallationHash && Object(global.screenshotsByInstallationHash).hasOwnProperty(hash)) {
		return [ ...global.screenshotsByInstallationHash[hash] ];
	}
	return [];
}
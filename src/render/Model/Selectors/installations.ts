
export function selectCurrentVersionHash(global) {
	return global.currentMainScreen?.hash || undefined;
}

export function selectInstallations(global) {
	return global.installations || {};
}

export function selectInstallation(global, versionHash) {
	if (global.installations && Object(global.installations).hasOwnProperty(versionHash)) {
		return { hash: versionHash, ...global.installations[versionHash] };
	}
	return undefined;
}

export function selectVersions(global, type) {
	type = type || 'all';
	if (global.versions) {
		return global.versions.filter((version) => type == 'all' ? true : version.type == type);
	}
	return [];
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
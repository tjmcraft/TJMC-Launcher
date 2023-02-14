
export function selectCurrentVersionHash(global) {
	return global.version_hash || undefined;
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
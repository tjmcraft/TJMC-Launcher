
export function updateVersions(global, update) {
	return {
		...global,
		versions: update.versions
	};
}
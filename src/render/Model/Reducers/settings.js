export function updateReleases(global, update) {
	return {
		...global,
		releases: update.releases,
	};
}
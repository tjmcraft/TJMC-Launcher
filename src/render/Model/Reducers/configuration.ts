
export function updateConfiguration(global, update) {
	return {
		...global,
		configuration: update.configuration,
	};
}
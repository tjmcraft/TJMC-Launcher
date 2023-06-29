
export function updateVersions(global, { versions }) {
	return {
		...global,
		versions: versions
	};
}
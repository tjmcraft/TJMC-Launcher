
export function updateInstances(global, { instances }) {
	console.debug(">>", instances);
	return {
		...global,
		instances: {
			...instances
		}
	};
}
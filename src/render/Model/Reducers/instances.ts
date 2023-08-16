
export function updateInstances(global, { instances }) {
	return {
		...global,
		instances: {
			...instances
		}
	};
}
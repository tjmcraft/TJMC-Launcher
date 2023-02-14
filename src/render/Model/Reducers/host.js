import { updateInstallation } from "./installations";

export function updateHostInfo(global, update) {
	return {
		...global,
		hostInfo: {
			//...global.hostInfo,
			...update.hostInfo,
		}
	};
}

export function updateGameError(global, update) {
	return {
		...global,

	};
}

export function updateGameStartupSuccess(global, update) {
	const { hash } = update;
	return updateInstallation(global, hash, {
		progress: 0,
		isProcessing: false,
	});
}
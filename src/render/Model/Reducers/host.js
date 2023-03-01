import { getState, setState } from "Util/Store";
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

export function updateGameError(global, actions, update) {
	const { hash, error } = update;

	actions.openModal({
		layer: "alert",
		title: "Construct error",
		content: error,
		type: "error",
		// buttons,
		multiline: true,
		label: "game.error"
	});

	global = getState();

	global = updateInstallation(global, hash, {
		progress: 0,
		isProcessing: false,
	});

	setState(global);
}

export function updateGameStartupSuccess(global, update) {
	const { hash } = update;
	return updateInstallation(global, hash, {
		progress: 0,
		isProcessing: false,
	});
}
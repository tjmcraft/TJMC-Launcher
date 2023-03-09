import { setState } from "Util/Store";
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
	setState(updateInstallation(global, hash, {
		progress: 0,
		isProcessing: false,
	}));

	actions.openModal({
		layer: "alert",
		title: "Construct error",
		content: error,
		type: "error",
		// buttons,
		multiline: true,
		label: "game.error"
	});
}

export function updateGameStartupError(global, actions, update) {
	const { hash, error } = update;
	setState(updateInstallation(global, hash, {
		progress: 0,
		isProcessing: false,
	}));

	actions.openModal({
		layer: "alert",
		title: "Startup error",
		content: error,
		type: "error",
		// buttons,
		multiline: true,
		label: "game.error"
	});
}

export function updateGameStartupSuccess(global, update) {
	const { hash } = update;
	setState(updateInstallation(global, hash, {
		progress: 0,
		isProcessing: false,
	}));
}

export function updateUpdate(global, update) {
	return {
		...global,
		update: {
			...global.update,
			...update,
		}
	};
}

export function updateStatus(global, _actions, payload) {
	const { status } = payload;
	return updateUpdate(global, { status: status });
}

export function updateProgress(global, _actions, payload) {
	const { progress } = payload;
	return updateUpdate(global, { status: "loading", progress: progress });
}
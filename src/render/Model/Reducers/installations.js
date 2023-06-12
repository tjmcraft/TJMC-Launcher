import { selectCurrentVersionHash, selectInstallation } from "Model/Selectors/installations";
import { getState, setState } from "Store/Global";
import ProgressStore from "Store/Progress";

export function replaceInstallation(global, hash, update) {
	return {
		...global,
		installations: {
			...global.installations,
			[hash]: update
		}
	};
}

export function updateInstallation(global, hash, update) {
	const installation = selectInstallation(global, hash);
	return {
		...global,
		installations: {
			...global.installations,
			[hash]: {
				...installation,
				...update,
			}
		}
	};
}


export function updateInstallations(global, update) {
	const currentHash = selectCurrentVersionHash(global);
	if (currentHash == undefined) {
		global.version_hash = Object.keys(update.installations)[0];
	}
	return {
		...global,
		installations: Object.fromEntries(Object.entries(update.installations).map(([key, value]) => {
			const current = global.installations[key];
			if (current != void 0) {
				value = Object.assign({}, current, value);
			}
			return [key, value];
		}))
	};
}

export function updateInstallationProgress(global, update) {
	const { hash, progress, progressType, totalProgress, time } = update;
	if (progressType == 'terminated') {
		setState(updateInstallation(global, hash, {
			isProcessing: false,
		}));
		ProgressStore.setState({
			...ProgressStore.getState(),
			[hash]: { progress: 0, totalProgress: 0 }
		});
	} else {
		if (!getState(global => selectInstallation(global, hash)).isProcessing) {
			setState(updateInstallation(global, hash, { isProcessing: true }));
		}
		ProgressStore.setState({
			...ProgressStore.getState(),
			[hash]: { progress: progress, progressType: progressType, totalProgress: totalProgress, time: time }
		});
	}
	return void 0;
}
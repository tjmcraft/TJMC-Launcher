import { selectCurrentVersionHash, selectInstallation } from "Model/Selectors/installations";

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
		installations: {
			//...global.installations,
			...update.installations,
		}
	};
}

export function updateInstallationProgress(global, update) {
	const { hash, progress } = update;
	return updateInstallation(global, hash, {
		progress,
		isProcessing: true,
	});
}

export function updateInstallationProcess(global, update) {
	const { hash, isProcessing } = update;
	return updateInstallation(global, hash, {
		...(!isProcessing ? { progress: 0 } : {}),
		isProcessing,
	});
}
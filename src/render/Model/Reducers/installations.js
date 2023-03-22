import { selectCurrentVersionHash, selectInstallation } from "Model/Selectors/installations";
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
		installations: {
			//...global.installations,
			...update.installations,
		}
	};
}

export function updateInstallationProgress(global, update) {
	const { hash, progress } = update;
	ProgressStore.setState({
		[hash]: { progress: progress }
	});
	return void 0;
}
import { setState } from "Store/Global";
import ProgressStore from "Store/Progress"
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
		isProcessing: false,
	}));

	ProgressStore.setState({
		...ProgressStore.getState(),
		[hash]: { progress: 0 }
	});

	actions.alert({
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
		isProcessing: false,
	}));

	ProgressStore.setState({
		...ProgressStore.getState(),
		[hash]: { progress: 0 }
	});

	actions.alert({
		title: "Startup error",
		content: error,
		type: "error",
		// buttons,
		multiline: true,
		label: "game.startup.error"
	});
}

export function updateGameStartupSuccess(global, update) {
	const { hash } = update;
	setState(updateInstallation(global, hash, {
		isProcessing: false,
	}));

	ProgressStore.setState({
		...ProgressStore.getState(),
		[hash]: { progress: 0 }
	});


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

export function updateStatus(global, actions, payload) {
	const { status, update } = payload;
	setState(updateUpdate(global, {
		status: status,
		...(update != undefined ? { next: update } : {})
	}));

	if (status == "available" && update != void 0) {
		actions.alert({
			title: `Доступно обновление до версии:\n${update.releaseName}`,
			content: `Вы можете скачать обновление прямо сейчас!`,
			type: "info",
			buttons: [
				{
					name: "Позже",
					closeOverlay: true,
				},
				{
					name: "Загрузить",
					class: ["filled", "colorBrand"],
					closeOverlay: true,
					callback: () => actions.updateDownload(),
				}
			],
			mini: true
		});
	}
	if (status == "loaded" && update != void 0) {
		actions.alert({
			title: `Обновление до версии:\n${update.releaseName}`,
			content: `Вам необходимо перезагрузить хост, чтобы установить обновление!`,
			type: "warn",
			buttons: [
				{
					name: "Позже",
					closeOverlay: true,
				},
				{
					name: "Перезагрузить",
					class: ["filled", "colorRed"],
					closeOverlay: true,
					callback: () => actions.updateInstall(),
				}
			],
			mini: true
		});
	}
}

export function updateProgress(global, _actions, payload) {
	const { progress, total, transferred, bytesPerSecond } = payload;
	return updateUpdate(global, {
		status: "loading",
		progress,
		total,
		transferred,
		bytesPerSecond,
	});
}
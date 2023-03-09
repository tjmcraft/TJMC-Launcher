import { TJMCConnectionState } from "Libs/IPCHostConnect/IPCConnection";

let onUpdate;

export function init(_onUpdate) {
	onUpdate = _onUpdate;
}

export function updater(update) {
	window.__debug_host__ && console.debug("-> HOST UPDATER", update);
	const type = update.type;
	const payload = update.payload;
	if (update instanceof TJMCConnectionState) {
		let connectionState;
		switch (update.state) {
			case TJMCConnectionState.disconnected:
				connectionState = 'connectionStateConnecting';
				break;
			case TJMCConnectionState.broken:
				connectionState = 'connectionStateBroken';
				break;
			case TJMCConnectionState.connected:
			default:
				connectionState = 'connectionStateReady';
				break;
		}
		onUpdate({
			type: "updateConnectionState",
			connectionState,
		});
	} else if (type == "game.progress.load") {
		payload?.version_hash && onUpdate({
			type: "updateInstallationsProgressLoad",
			hash: payload.version_hash,
			progress: payload.progress,
		});
	} else if (type == "game.progress.download") {
		payload?.version_hash && onUpdate({
			type: "updateInstallationsProgressDownload",
			hash: payload.version_hash,
			progress: payload.progress,
		});
	} else if (type == "game.startup.error") {
		payload?.version_hash && onUpdate({
			type: "updateGameStartupError",
			hash: payload.version_hash,
			error: payload.error,
		});
	} else if (type == "game.startup.success") {
		payload?.version_hash && onUpdate({
			type: "updateGameStartupSuccess",
			hash: payload.version_hash,
		});
	} else if (type == "updateInstallations") {
		payload?.installations && onUpdate({
			type: "updateInstallations",
			installations: payload.installations,
		});
	} else if (type == "updateConfiguration") {
		payload?.configuration && onUpdate({
			type: "updateConfiguration",
			configuration: payload.configuration,
		});
	} else if (type == "game.error") {
		payload?.version_hash && onUpdate({
			type: "updateGameError",
			hash: payload.version_hash,
			error: payload.error,
		});
	} else if (type == "update.status") {
		payload?.status && onUpdate({
			type: "updateStatus",
			status: payload.status,
			update: payload?.update,
		});
	} else if (type == "update.progress") {
		payload?.percent != undefined && onUpdate({
			type: "updateProgress",
			progress: payload.percent,
			total: payload.total,
			transferred: payload.transferred,
			bytesPerSecond: payload.bytesPerSecond,
		});
	} else {
		window.__debug_host__ && console.debug("-> HOST UNEXPECTED UPDATE", update);
	}
}
import { TJMCConnectionState } from "Libs/IPCHostConnect/IPCConnection";

let onUpdate;

export function init(_onUpdate) {
	onUpdate = _onUpdate;
}

export function updater(update) {
	window.__debug_host__ && console.debug("-> API UPDATER", update);
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
	} else if (update.type == "game.progress.load") {
		update.payload?.version_hash && onUpdate({
			type: "updateInstallationsProgressLoad",
			hash: update.payload.version_hash,
			progress: update.payload.progress,
		});
	} else if (update.type == "game.progress.download") {
		update.payload?.version_hash && onUpdate({
			type: "updateInstallationsProgressDownload",
			hash: update.payload.version_hash,
			progress: update.payload.progress,
		});
	} else if (update.type == "game.startup.success") {
		update.payload?.version_hash && onUpdate({
			type: "updateGameStartupSuccess",
			hash: update.payload.version_hash,
		});
	} else if (update.type == "updateInstallations") {
		update.payload?.installations && onUpdate({
			type: "updateInstallations",
			installations: update.payload.installations,
		});
	} else if (update.type == "updateConfiguration") {
		update.payload?.configuration && onUpdate({
			type: "updateConfiguration",
			configuration: update.payload.configuration,
		});
	} else if (update.type == "game.error") {
		update.payload?.error && onUpdate({
			type: "updateGameError",
			hash: update.payload.version_hash,
			error: update.payload.error,
		});
	} else {
		window.__debug_host__ && console.debug("-> HOST UNEXPECTED UPDATE", update);
	}
}
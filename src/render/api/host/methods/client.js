
import IPCClient from "Libs/IPCHostConnect/client";
import { TJMCConnectionState } from "Libs/IPCHostConnect/IPCConnection";
import { updater } from "../updater";
import { fetchConfiguration, fetchHostInfo } from "./host";
import { fetchInstallations } from "./installation";

let client;
let onUpdate;
let isConnected = false;

export async function init(_onUpdate, initialArgs) {
	window.__debug_host__ && console.debug(">>> START INIT IPCHOST");

	onUpdate = _onUpdate;

	client = new IPCClient();

	client.addEventHandler(handleTJMCUpdate);
	client.addEventHandler(updater);

	try {

		self.invoke = invokeRequest;

		try {
			await client.connect();
		} catch (err) {
			console.error(err);
			onUpdate({
				type: 'updateConnectionState',
				connectionState: 'connectionStateBroken',
			});
			return;
		}

		window.__debug_host__ && console.debug(">>> FINISH INIT IPCHOST");

		onUpdate({ type: 'updateApiReady' });

		void fetchHostInfo();
		void fetchConfiguration();
		void fetchInstallations();

	} catch (err) {
		console.error(">> connecting error");
		throw err;
	}
}

function handleTJMCUpdate(update) {
	if (update instanceof TJMCConnectionState) {
		isConnected = update.state === TJMCConnectionState.connected;
	}
}

export async function invokeRequest(request, shouldReturnTrue = false, shouldThrow = false, ignoreUpdates = false) {
	if (!isConnected) return undefined;

	try {
		//console.debug(">> INVOKE SWING SEND", request);
		let result = await client.invoke(request);
		//console.debug(">> INVOKE SWING PATCH", result);

		if (!ignoreUpdates) {
			handleUpdatesFromRequest(result, request);
		}

		return shouldReturnTrue ? result && true : result;
	} catch (e) {
		if (shouldThrow) throw e;
		return undefined;
	}
}

function handleUpdatesFromRequest(update, request) {
	updater(update);
}
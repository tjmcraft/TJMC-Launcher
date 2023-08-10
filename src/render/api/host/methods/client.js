
import IPCClient from "Libs/IPCHostConnect/client";
import { TJMCConnectionState } from "Libs/IPCHostConnect/IPCConnection";
import { updater } from "../updater";
import { fetchHostInfo } from "./host";
import { fetchConfiguration } from "./config";
import { fetchInstances } from "./instances";
import { fetchInstallations } from "./installation";
import { fetchCurrentUser } from "./auth";

let client;
let onUpdate;
let isConnected = false;

export async function init(_onUpdate, _initialArgs) {
	window.__debug_host__ && console.debug(">>> START INIT IPCHOST");

	onUpdate = _onUpdate;

	client = new IPCClient();

	client.addEventHandler(handleTJMCUpdate);
	client.addEventHandler(updater);

	try {

		// self.invoke = invokeRequest;

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
		void fetchCurrentUser();
		void fetchInstallations();
		void fetchInstances();

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
	if (!isConnected) {
		console.warn(">> INVOKE WHILE DISCONNECTED");
		return undefined;
	}

	try {
		// console.debug(">> INVOKE SWING SEND", request);
		const result = await client.invoke(request);
		// console.debug(">> INVOKE SWING PATCH", result);

		if (!ignoreUpdates) {
			handleUpdatesFromRequest(result, request);
		}

		return shouldReturnTrue ? result && true : result;
	} catch (e) {
		if (shouldThrow) throw e;
		return undefined;
	}
}

function handleUpdatesFromRequest(update, _request) {
	updater(update);
}
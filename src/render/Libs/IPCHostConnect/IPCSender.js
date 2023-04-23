import { TJMCConnectionState } from "Libs/IPCHostConnect/IPCConnection";


export default class IPCHostSender {

	static DEFAULT_OPTIONS = {
		updateCallback: undefined,
	};

	constructor(opts = IPCHostSender.DEFAULT_OPTIONS) {
		const args = { ...IPCHostSender.DEFAULT_OPTIONS, ...opts };
		this._updateCallback = args.updateCallback;

		this._handlers = {
			ack: this._handleAck.bind(this),
		};
	}

	async connect() {
		try {
			Object.keys(this._handlers).forEach(event => {
				window.electron.on(event, (sender, message) => this._handlers[event](message)); // handle all types
			});
			this._updateCallback(new TJMCConnectionState(TJMCConnectionState.connected));
		} catch (e) {
			this._updateCallback(new TJMCConnectionState(TJMCConnectionState.disconnected));
			return;
		}
		return true;
	}

	_handleUpdate(message) {
		if (this._updateCallback) this._updateCallback(message);
	}

	_handleAck(message) {
		// console.debug("[handleAck]", message.data);
		this._handleUpdate(message.data);
	}

	sendWithInvoke(request) {
		return new Promise((resolve, reject) => {
			window.electron.invoke(request.type, request.data).then((message) => {
				const result = message.data;
				if (result) {
					resolve(result);
				}
			});
		});
	}


}
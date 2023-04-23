import IPCHostSender from "./IPCSender";


export default class IPCClient {

	static DEFAULT_OPTIONS = {
		requestRetries: 5
	};

	constructor(opts = IPCClient.DEFAULT_OPTIONS) {
		const args = { ...IPCClient.DEFAULT_OPTIONS, ...opts };
		this._requestRetries = args.requestRetries;
		this._args = args;
	}

	_eventBuilders = [];

	addEventHandler(handler) {
		this._eventBuilders.push(handler);
	}

	async connect() {

		if (this._sender == undefined) {
			this._sender = new IPCHostSender({
				updateCallback: this._handleUpdate.bind(this)
			});
		}

		const newConnection = await this._sender.connect();

		console.debug("IPCClient connected", newConnection);
	}

	async invoke(request) {
		//console.debug(">>> IPC invoke", request);
		const sender = this._sender;
		let attempt = 0;
		for (attempt = 0; attempt < this._requestRetries; attempt++) {
			const promise = sender.sendWithInvoke(request);
			//console.debug(">> IPC PROM", promise)
			return await promise;
		}
		throw new Error(`Request was unsuccessful ${attempt} time(s)`);
	}

	_handleUpdate(update) {
		if (update) {
			this._processUpdate(update);
		}
	}

	_processUpdate(update) {
		this._dispatchUpdate({ update });
	}

	async _dispatchUpdate(args = {
		update: undefined
	}) {
		for (const callback of this._eventBuilders) {
			await callback(args.update);
		}
	}

}
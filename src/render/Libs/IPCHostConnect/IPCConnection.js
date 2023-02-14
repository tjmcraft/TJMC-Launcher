
export class TJMCConnectionState {
	static disconnected = -1;
	static connected = 1;
	static broken = 0;
	constructor(state) {
		this.state = state;
	}
}

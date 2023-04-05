const CallbackStore = require("../util/CallbackStore");

const codeHandler = new CallbackStore();

exports.handleCode = (code) => {
	// here second step oauth2
	if (code != void 0) {
		codeHandler.runCallbacks(code);
	}
};

exports.onCodeHandle = (handler = (code) => void 0) => {
	codeHandler.addCallback(handler);
};
const logger = require('./util/loggerutil')('%c[Main-Proto]', 'color: #ff2119; font-weight: bold;');
const { app } = require('electron');
const { startLaunch } = require('./Launcher');

const DEFAULT_PROTOCOL_HANDLER = "tjmc";

const setInstanceProtocolHandler = () => {
	if (process.platform === "linux") {
		const command = "xdg-settings set default-url-scheme-handler"
		const packageName = "tjmc-launcher_tjmc-launcher.desktop"

		// TODO: Figure out bug in setAsDefaultProtocolClient on Linux
		// Set Protocol Handler on Linux manually because of bug in Electron
		try {
			require('child_process').exec(`${command} ${DEFAULT_PROTOCOL_HANDLER} ${packageName}`)
			logger.info("Successfully set protocol handler on Linux.")
		} catch (e) {
			logger.warn(`Failed to set Protocol Handler on Linux: ${e}`)
		}
	} else {
		app.setAsDefaultProtocolClient(DEFAULT_PROTOCOL_HANDLER)
	}
}
exports.setInstanceProtocolHandler = setInstanceProtocolHandler;

const protoHandler = (link) => {
	if (!link) return;

	const { host: command, path: argument } = require('url').parse(link);
	const args = argument.split('/').slice(1);

	logger.debug("[ProtoHandler]", link, "->", command, args);

	switch (command) {

		case "launch": {
			const version_hash = args[0];
			startLaunch(version_hash);
		}; break;

		default: return false;
	}

	return true;
};
exports.protoHandler = protoHandler;

const handleArgsLink = (args) => {
	if (process.platform === 'win32') {
		const deepLink = args.find((arg) => arg.startsWith(DEFAULT_PROTOCOL_HANDLER + '://'));
		if (deepLink) return protoHandler(deepLink);
	}
	return false;
}
exports.handleArgsLink = handleArgsLink;
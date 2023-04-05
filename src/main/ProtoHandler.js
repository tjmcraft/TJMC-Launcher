const logger = require('./util/loggerutil')('%c[ProtoHandler]', 'color: #ff2119; font-weight: bold;');
const { app } = require('electron');
const { startLaunch } = require('./Launcher');
const path = require('node:path');
const { handleCode } = require('./managers/AuthManager');

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
		if (process.defaultApp) {
			if (process.argv.length >= 2) {
				app.setAsDefaultProtocolClient(DEFAULT_PROTOCOL_HANDLER, process.execPath, [path.resolve(process.argv[1])])
			}
		} else {
			app.setAsDefaultProtocolClient(DEFAULT_PROTOCOL_HANDLER)
		}
	}
}
exports.setInstanceProtocolHandler = setInstanceProtocolHandler;

const protoHandler = (link) => {
	if (!link) return;

	const { hostname, pathname, searchParams } = new URL(link);
	const command = hostname;
	const args = pathname.split('/').filter(Boolean);
	const params = Object.fromEntries(searchParams.entries());

	logger.debug(link, "->", command, args);

	switch (command) {

		case "launch": {
			const version_hash = args[0];
			startLaunch(version_hash);
		}; break;

		case "authorize": {
			logger.debug(params.code);
			if (params.code) {
				handleCode(params.code);
			}
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
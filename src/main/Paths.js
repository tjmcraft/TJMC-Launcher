const path = require('node:path');

const launcherDir = path.normalize(
	(
			process.env.APPDATA || (
					process.platform == 'darwin' ?
							process.env.HOME + '/Library/Preferences' :
							process.env.HOME + "/.local/share"
			)
	) + '/.tjmc'
) || require('electron').remote.app.getPath('userData');

exports.launcherDir = launcherDir;
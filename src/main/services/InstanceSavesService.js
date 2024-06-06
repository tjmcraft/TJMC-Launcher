
const fs = require("node:fs");
const path = require("node:path");
const { getOption } = require("../managers/ConfigManager");

const getProfileDirectory = (name = null) => path.join(getOption('overrides.path.minecraft'), "instances", name);

module.exports.getSaves = async (profile_name) => {
	const profileDirectory = getProfileDirectory(profile_name);
	const savesDirectory = path.join(profileDirectory, "saves");
	if (!fs.existsSync(savesDirectory)) fs.mkdirSync(savesDirectory, { recursive: true });
	const saves = fs.readdirSync(savesDirectory, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name).map(e => ({
		path: path.join(savesDirectory, e),
		name: e,
		iconPath: path.join(savesDirectory, e, 'icon.png'),
	}));
	console.debug(">>saves", saves);
	return saves || [];
};
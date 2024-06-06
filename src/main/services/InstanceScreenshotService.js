const fs = require("node:fs");
const path = require("node:path");
const { getOption } = require("../managers/ConfigManager");

const getProfileDirectory = (name = null) => path.join(getOption('overrides.path.minecraft'), "instances", name);

module.exports.getScreenshots = async (profile_name) => {
	const profileDirectory = getProfileDirectory(profile_name);
	const screenshotsDirectory = path.join(profileDirectory, "screenshots");
	if (!fs.existsSync(screenshotsDirectory)) fs.mkdirSync(screenshotsDirectory, { recursive: true });
	const screenshots = fs.readdirSync(screenshotsDirectory, { withFileTypes: true }).filter(e => e.isFile()).map(e => e.name).map(e => ({
		path: path.join(screenshotsDirectory, e),
		name: e,
	}));
	console.debug(">>", screenshots);
	return screenshots || [];
};

module.exports.openScreenshot = () => { };
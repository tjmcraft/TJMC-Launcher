
const fs = require("node:fs");
const nbt = require('prismarine-nbt');
const path = require("node:path");
const { getOption } = require("../managers/ConfigManager");

const getProfileDirectory = (name = null) => path.join(getOption('overrides.path.minecraft'), "instances", name);

/**
 *
 * @param {import("node:fs").PathLike} save
 * @returns {import("../global").HostInstallationSave['meta']}
 */
const readSaveMetadata = async (save) => {
	var data = fs.readFileSync(path.join(save, 'level.dat'));
	const { parsed, metadata } = await nbt.parse(data);
	// console.debug(">>", parsed.value['Data'].value);
	return {
		mode: parsed.value['Data'].value['GameType'].value,
		levelName: parsed.value['Data'].value['LevelName'].value,
		gameVersion: parsed.value['Data'].value['Version'].value['Name'].value,
		difficulty: parsed.value['Data'].value['Difficulty'].value,
		time: Number(parsed.value['Data'].value['DayTime'].value),
		lastPlayed: Number(parsed.value['Data'].value['LastPlayed'].value),
	};

};

/**
 *
 * @param {string} profile_name
 * @returns {import("../global").HostInstallationSave[]}
 */
module.exports.getSaves = async (profile_name) => {
	const profileDirectory = getProfileDirectory(profile_name);
	const savesDirectory = path.join(profileDirectory, "saves");
	if (!fs.existsSync(savesDirectory)) fs.mkdirSync(savesDirectory, { recursive: true });
	const savesNames = fs.readdirSync(savesDirectory, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name);
	const saves = await Promise.all(savesNames.map(async e => {
		let meta = await readSaveMetadata(path.join(savesDirectory, e));
		return {
			path: path.join(savesDirectory, e),
			name: e,
			iconPath: path.join(savesDirectory, e, 'icon.png'),
			meta: meta,
		};
	}));
	console.debug(">>saves", saves);
	return saves || [];
};

module.exports.getSavesDir = (profile_name) => {
	const profileDirectory = getProfileDirectory(profile_name);
	const savesDirectory = path.join(profileDirectory, "saves");
	if (!fs.existsSync(savesDirectory)) fs.mkdirSync(savesDirectory, { recursive: true });
	return savesDirectory;
};
module.exports.getSaveDir = (profile_name, save_name) => {
	const profileDirectory = getProfileDirectory(profile_name);
	const savesDirectory = path.join(profileDirectory, "saves");
	if (!fs.existsSync(savesDirectory)) fs.mkdirSync(savesDirectory, { recursive: true });
	return path.join(savesDirectory, save_name);
};
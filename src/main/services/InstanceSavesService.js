
const fs = require("node:fs");
const nbt = require('prismarine-nbt');
const { deserialize } = require('@xmcl/nbt');
const path = require("node:path");
const { getOption } = require("../managers/ConfigManager");

const getProfileDirectory = (name = null) => path.join(getOption('overrides.path.minecraft'), "instances", name);

/**
 *
 * @param {import("node:fs").PathLike} save
 * @returns {import("../global").HostInstallationSave['meta']}
 */
const readSaveMetadata = async (save) => {
	var data = await fs.readFileSync(path.join(save, 'level.dat'));
	const { Data } = await deserialize(data, { compressed: 'gzip' });
	// const { parsed, metadata } = await nbt.parse(data);
	// const saveMeta = parsed.value['Data'].value;
	// console.debug(">>", Data);
	return {
		mode: Data['GameType'],
		levelName: Data['LevelName'],
		gameVersion: Data.Version?.Name || Data.version,
		difficulty: Data['Difficulty'],
		time: Number(Data['DayTime']),
		lastPlayed: Number(Data['LastPlayed']),
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
		const root = path.join(savesDirectory, e);
		let meta = await readSaveMetadata(root);
		const iconPath = path.join(root, 'icon.png');
		return {
			name: e,
			path: root,
			iconPath: fs.existsSync(iconPath) ? iconPath : path.join(__dirname, "../game", 'assets', 'minecraft_icon.png'),
			meta: meta,
		};
	}));
	console.debug("[InstanceSavesService]", saves);
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
const fs = require("node:fs");
const path = require("node:path");
const { getOption } = require("../managers/ConfigManager");
const AdmZip = require("adm-zip");
const { stat } = require("node:fs/promises");

const openResourcePack = async (basePath) => {
	if (typeof basePath === 'string') {
		const fstat = await stat(basePath);
		if (fstat.isDirectory()) { } else {

		}
	}
}

module.exports.getLocalResourcePacks = async () => {
	const resDir = path.join(getOption('overrides.path.minecraft'), "resourcepacks");
	if (!fs.existsSync(resDir)) fs.mkdirSync(resDir, { recursive: true });
	const resNames = fs.readdirSync(resDir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name);
	const res = await Promise.all(resNames.map(async e => {
		const root = path.join(resDir, e);
		new AdmZip().readFile()

		return {
			name: e,
			path: root,
		};
	}));
	console.debug(">>res", res);
	return res || [];
};
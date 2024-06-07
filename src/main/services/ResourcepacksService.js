const fs = require("node:fs");
const path = require("node:path");
const { getOption } = require("../managers/ConfigManager");
const AdmZip = require("adm-zip");
const { stat } = require("node:fs/promises");

const openResourcePack = async (basePath) => {
	if (typeof basePath === 'string') {
		let metadata = null;
		let icon = null;
		const fstat = await stat(basePath);
		if (fstat.isDirectory()) { // dir fs
			{
				const metaPath = path.join(basePath, 'pack.mcmeta');
				if (fs.existsSync(metaPath)) {
					const meta = JSON.parse(fs.readFileSync(metaPath));
					if (!meta.pack) {
						throw new Error("Illegal Resourcepack: pack.mcmeta doesn't contain the pack metadata!")
					}
					metadata = meta.pack;
				}
			}
			{
				const iconPath = path.join(basePath, 'pack.png');
				if (fs.existsSync(iconPath)) icon = fs.readFileSync(iconPath);
			}
		} else { // zip fs
			const zip = new AdmZip(basePath);
			let entries = zip.getEntries();
			{
				let meta = entries.find(e => e.entryName == "pack.mcmeta");
				meta = JSON.parse(meta.getData().toString("utf8"));
				if (!meta.pack) {
					throw new Error("Illegal Resourcepack: pack.mcmeta doesn't contain the pack metadata!")
				}
				metadata = meta.pack;
			}
			{
				icon = entries.find(e => e.entryName == "pack.png");
				icon = icon.getData().toString("utf8");
			}
		}
		console.debug(">>>", metadata, icon);
		return { metadata, icon };
	}
}

module.exports.getLocalResourcePacks = async () => {
	const resDir = path.join(getOption('overrides.path.minecraft'), "resourcepacks");
	if (!fs.existsSync(resDir)) fs.mkdirSync(resDir, { recursive: true });
	const resNames = fs.readdirSync(resDir, { withFileTypes: true }).map(e => e.name);
	const res = await Promise.all(resNames.map(async e => {
		const root = path.join(resDir, e);
		openResourcePack(root);
		return {
			name: e,
			path: root,
		};
	}));
	console.debug(">>res", res);
	return res || [];
};
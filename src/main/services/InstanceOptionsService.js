const path = require("node:path");
const fs = require("node:fs/promises");
const gamesetting = require("@xmcl/gamesetting");
const { getOption } = require("../managers/ConfigManager");

const getProfileDirectory = (name = null) => path.join(getOption('overrides.path.minecraft'), "instances", name);

module.exports.getGameOptions = async (profile_name) => {
	const profileDirectory = getProfileDirectory(profile_name);
	const optionsPath = path.join(profileDirectory, "options.txt");
	const result = await fs.readFile(optionsPath, 'utf-8').then(gamesetting.parse, () => { });

	if (typeof result.resourcePacks === 'string') {
		try {
			result.resourcePacks = JSON.parse(result.resourcePacks)
		} catch (e) {
			if (e instanceof SyntaxError) {
				this.error(new AnyError('InvalidOptionsResourcePacks', result.resourcePacks))
			} else {
				this.error(e)
			}
			result.resourcePacks = []
		}
	}

	console.debug("[InstanceOptionsService]", result);

	return result;
};
const fs = require('node:fs');
const path = require('node:path');
const Config = require('../libs/Config');
const { getOption } = require('./ConfigManager');
const { cleanObject } = require('../util/Tools');
const { generateIdFor } = require('../util/Random');
const { launcherDir } = require('../Paths');


/* ============= INSTALLATIONS ============= */

const config = new Config({
	prefix: "InstallationsManager",
	color: "#0066d6",
	configName: "launcher-profiles.json",
	configDir: launcherDir,
	defaultConfig: Object.seal({
		tjmcVersion: '1.0.0',
		profiles: {},
	})
});

module.exports.load = () => config.load();
module.exports.addCallback = config.addCallback;
module.exports.removeCallback = config.removeCallback;

/**
 * @typedef Installation
 * @type {object}
 * @property {Date} created The date when installation is created
 * @property {string} icon Icon of installation (feature)
 * @property {'custom'} type Type of installation
 * @property {fs.PathLike} gameDir Game directory
 * @property {fs.PathLike} versionDir Version directory
 * @property {fs.PathLike} mcPath Path when main jar is located
 * @property {fs.PathLike} javaPath Path when java executable is located
 * @property {string} javaArgs Additional arguments for java
 * @property {Date} lastUsed Last used time
 * @property {Date} lastSync Last success file sync time
 * @property {string} lastVersionId Version id
 * @property {string} name Name of Installation
 * @property {object} resolution Resolution object
 * @property {number} resolution.width Resolution width
 * @property {number} resolution.height Resolution height
 * @property {boolean} resolution.fullscreen Resolution fullscreen mode
 * @property {boolean} checkHash Check hash of installation files
 * @property {boolean} checkFiles Check files in installation directories
 * @property {boolean} autoConnect Connect to TJMC server automatically
 */

/**
 * Default installation scheme
 * @type {Installation}
 */
const DEFAULT_PROFILE = Object.seal({
	created: new Date().toISOString(),
	icon: undefined,
	type: 'custom',
	gameDir: undefined,
	versionDir: undefined,
	mcPath: undefined,
	javaPath: undefined,
	javaArgs: undefined,
	lastUsed: undefined,
	lastSync: undefined,
	lastVersionId: undefined,
	name: undefined,
	resolution: {
		width: undefined,
		height: undefined,
		fullscreen: undefined,
	},
	checkHash: undefined,
	checkFiles: undefined,
	autoConnect: undefined,
});

/**
 * Create new installation
 * @param {Object} options - Options for version
 * @param {Object} options.name - Name of the version
 * @param {Object} options.type - Type of the version
 * @param {Object} options.gameDir - Directory of the version
 * @param {Object} options.javaPath - Path to executable java file
 * @param {Object} options.javaArgs - Arguments for java machine
 * @param {Object} options.resolution - Resolution of the game window
 * @param {Object} options.resolution.width - Width of the game window
 * @param {Object} options.resolution.height - Height of the game window
 * @returns {string} - Hash of the created installation profile
 */
exports.createInstallation = async function (options = {}) {
	const current_date = new Date().toISOString();
	options = Object.assign(DEFAULT_PROFILE, { // reassign
		created: current_date,
	}, options);
	const profile = cleanObject(options);
	const installations = config.getOption("profiles");
	if (profile) {
		const hash = generateIdFor(installations);
		const next = Object.assign({}, {
			[hash]: profile
		}, installations);
		config.setOption("profiles", next);
		return hash;
	}
	return undefined;
}

/**
 * Get all known Installations from config
 * @returns {Object.<string,Installation>}
 */
exports.getInstallations = () => {
	return config.getOption("profiles");
}

/**
 * Returns the installation with the given hash
 * @param {string} hash - The hash of the installation
 * @returns {Promise<Installation>} - The installation's object
 */
exports.getInstallation = async (hash) => {
	return exports.getInstallationSync(hash);
}

/**
 * Returns the installation with the given hash (SYNC)
 * @param {string} hash - The hash of the installation
 * @returns {Installation} - The installation's object
 */
exports.getInstallationSync = (hash) => {
	const installations = this.getInstallations();
	if (hash && Object(installations).hasOwnProperty(hash)) {
		let installation = installations[hash];
		installation = Object.assign({}, DEFAULT_PROFILE, {
			hash: hash,
		}, installation);
		installation.gameDir = installation.gameDir ??
			path.resolve(getOption('overrides.path.gameDirectory') || getOption('overrides.path.minecraft'));
		installation.versionDir = installation.versionDir ??
			path.join(getOption('overrides.path.versions'), installation.lastVersionId);
		installation.mcPath = installation.mcPath ??
			path.join(getOption('overrides.path.versions'), installation.lastVersionId, `${installation.lastVersionId}.jar`);
		installation.checkHash = installation.checkHash ?? getOption('overrides.checkHash');
		installation.checkFiles = installation.checkFiles ?? getOption('overrides.checkFiles');
		installation.autoConnect = installation.autoConnect ?? getOption('minecraft.autoConnect');
		installation.javaPath = installation.javaPath ?? getOption('java.path');
		installation.javaArgs = installation.javaArgs ?? getOption('java.args');
		if (!installation.lastSync) { // force sync if error
			installation.checkHash = true;
			installation.checkFiles = true;
		}
		installation.resolution = {
			width: installation.resolution?.width ?? getOption('minecraft.launch.width'),
			height: installation.resolution?.height ?? getOption('minecraft.launch.height'),
			fullscreen: installation.resolution?.fullscreen ?? getOption('minecraft.launch.fullscreen'),
		};
		return installation;
	}
	return undefined;
}

/**
 * Delete the installation with given hash
 * @param {string} hash - The hash of the installation
 * @param {boolean} forceDeps - Should we delete all dependencies
 * @returns {boolean} - Whether the deletion is success
 */
exports.removeInstallation = async function (hash, forceDeps = false) {
	const { removeVersion } = require('./VersionManager');
	const installations = config.getOption("profiles");
	if (hash && Object(installations).hasOwnProperty(hash)) {
		const installation = installations[hash];
		if (forceDeps) {
			await removeVersion(installation.lastVersionId);
		}
		delete installations[hash];
		config.setOption("profiles", installations);
		return hash;
	}
	return undefined;
}

/**
 * Modify the installation with given hash
 * @param {string} hash The hash of the installation
 * @param {Installation} nextProps Props to modify
 */
exports.modifyInstallation = async function (hash, nextProps) {
	const installations = config.getOption("profiles");
	if (hash && Object(installations).hasOwnProperty(hash)) {
		const installation = installations[hash];
		Object.assign(installation, nextProps, {
			resolution: {
				...installation?.resolution,
				...nextProps?.resolution,
			},
		});
		installations[hash] = cleanObject(installation);
		config.setOption("profiles", installations);
		return hash;
	}
	return undefined;
}

exports.moveInstallationPosition = async function (startHash, endHash) {
	const installations = config.getOption("profiles");
	if (!startHash || !endHash) return;
	if (startHash === endHash) return;
	if (Object(installations).hasOwnProperty(startHash) && Object(installations).hasOwnProperty(endHash)) {
		const items = [...Object.entries(installations)];
		const startIndex = items.findIndex(e => e[0] == startHash);
		const endIndex = items.findIndex(e => e[0] == endHash);
		const [draggedItem] = items.splice(startIndex, 1);
		items.splice(endIndex, 0, draggedItem);
		const next = Object.fromEntries(items);
		config.setOption("profiles", next);
		return endHash;
	}
	return undefined;
}
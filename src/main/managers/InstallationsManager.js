const fs = require('node:fs');
const path = require('node:path');
const { launcherDir } = require('../Paths');
const { getOption } = require('./ConfigManager');
const { cleanObject } = require('../util/Tools');
const { generateIdFor } = require('../util/Random');
const LoggerUtil = require('../util/loggerutil');
const CallbackStore = require('../util/CallbackStore');

const callbacks = new CallbackStore();


/* ============= INSTALLATIONS ============= */

const logger = LoggerUtil('%c[InstallationsManager]', 'color: #0066d6; font-weight: bold');

const installations = {};
var versions_directory = path.join(launcherDir, "instances");

module.exports.load = () => {
	versions_directory = path.join(getOption('overrides.path.minecraft'), "instances");
	if (!fs.existsSync(versions_directory)) fs.mkdirSync(versions_directory, { recursive: true });
	try {
		fs.readdirSync(versions_directory).forEach(folder_name => {
			const ver_path = path.join(versions_directory, folder_name, 'instance.json');
			if (fs.existsSync(ver_path)) {
				let profile = null;
				try {
					profile = JSON.parse(fs.readFileSync(ver_path, 'utf8'));
					installations[profile.hash] = profile;
				} catch (err) {
					logger.error("Error reading instance file for: " + folder_name + "\n" + error);
				}
				if (profile && folder_name != profile.name)
					fs.renameSync(path.join(versions_directory, folder_name), path.join(versions_directory, profile.name));
			}
		});
		return (installations);
	} catch (error) {
		logger.error("Error while parsing local versions: " + error)
		return
	}
};

module.exports.addCallback = (callback = () => void 0) => {
	if (callback) callbacks.addCallback(callback);
};
module.exports.removeCallback = (callback = () => void 0) => {
	if (callback) callbacks.removeCallback(callback);
};

/**
 * Write Installation to instance file
 * @param {import('../global').HostInstallation} profile
 * @returns
 */
const writeInstallationProfile = (profile) => {
	installations[profile.hash] = profile;
	const instancePath = path.join(versions_directory, profile.name, 'instance.json');
	if (!fs.existsSync(instancePath)) fs.mkdirSync(path.join(instancePath, '..'), { recursive: true });
	try {
		const content = JSON.stringify(installations[profile.hash], null, 4);
		fs.writeFileSync(instancePath, content, 'utf-8');
	} catch (err) {
		logger.error("Error while writing instance file: " + profile.name + "\n" + err);
	}
	callbacks.runCallbacks(installations);
	return profile.hash;
};

/**
 * Default installation scheme
 * @type {import('../global').HostInstallation}
 */
const DEFAULT_PROFILE = Object.seal({
	created_at: new Date().toISOString(),
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
		created_at: current_date,
	}, options);
	const profile = cleanObject(options);
	if (profile) {
		const hash = generateIdFor(installations);
		writeInstallationProfile({ ...profile, hash });
		return hash;
	}
	return undefined;
}

/**
 * Get all known Installations from config
 * @returns {Object.<string,import('../global').HostInstallation>}
 */
exports.getInstallations = () => {
	return installations;
}

/**
 * Returns the installation with the given hash
 * @param {string} hash - The hash of the installation
 * @returns {Promise<import('../global').HostInstallation>} - The installation's object
 */
exports.getInstallation = async (hash) => {
	if (hash && Object(installations).hasOwnProperty(hash)) {
		return installations[hash];
	}
	return undefined;
}

/**
 * Returns the installation with the given hash (SYNC)
 * @param {string} hash - The hash of the installation
 * @returns {import('../global').HostInstallation} - The installation's object
 */
exports.getInstallationSync = (hash) => {
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
	const installations = this.getInstallations();
	if (hash && Object(installations).hasOwnProperty(hash)) {
		const installation = installations[hash];
		if (forceDeps) {
			await removeVersion(installation.lastVersionId);
		}
		delete installations[hash];
		const ver_path = path.join(versions_directory, installation.name);
		fs.rmSync(ver_path, { recursive: true, force: true });
		callbacks.runCallbacks(installations);
		return hash;
	}
	return undefined;
}

/**
 * Modify the installation with given hash
 * @param {string} hash The hash of the installation
 * @param {import('../global').HostInstallation} nextProps Props to modify
 */
exports.modifyInstallation = async function (hash, nextProps) {
	if (hash && Object(installations).hasOwnProperty(hash)) {
		const installation = installations[hash];
		Object.assign(installation, nextProps, {
			resolution: {
				...installation?.resolution,
				...nextProps?.resolution,
			},
		});
		installations[hash] = cleanObject(installation);
		writeInstallationProfile({ ...installation, hash });
		return hash;
	}
	return undefined;
}
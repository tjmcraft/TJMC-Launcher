const Config = require('../libs/Config');
const { cleanObject } = require('../util/Tools');
const { generateIdFor } = require('../util/Random');


/* ============= INSTALLATIONS ============= */

const config = new Config({
    prefix: "InstallationsManager",
    color: "#0066d6",
    configName: "launcher-profiles.json",
    defaultConfig: Object.seal({
        tjmcVersion: '1.0.0',
        profiles: {},
    })
});

module.exports.load = (dir_path) => config.load(dir_path);
module.exports.addCallback = config.addCallback;
module.exports.removeCallback = config.removeCallback;

const DEFAULT_PROFILE = {
    created: new Date().toISOString(),
    icon: undefined,
    type: 'custom',
    gameDir: undefined,
    versionDir: undefined,
    mcPath: undefined,
    javaPath: undefined,
    javaArgs: undefined,
    lastUsed: undefined,
    lastVersionId: undefined,
    name: undefined,
    resolution: {
        width: undefined,
        height: undefined,
        fullscreen: undefined,
    },
    checkHash: undefined,
};

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
 * @returns {String} - Hash of the created installation profile
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
        Object.assign(installations, {
            [hash]: cleanObject(profile)
        });
        config.setOption("profiles", installations);
        return hash;
    }
    return undefined;
}

exports.getInstallations = async function () {
    return config.getOption("profiles");
}

/**
 * Returns the installation with the given hash
 * @param {*} hash - The hash of the installation
 * @returns {Object} - The installation's object
 */
exports.getInstallation = async function (hash) {
    return exports.getInstallationSync(hash);
}

/**
 * Returns the installation with the given hash (SYNC)
 * @param {*} hash - The hash of the installation
 * @returns {Object} - The installation's object
 */
exports.getInstallationSync = function (hash) {
    const path = require('node:path');
    const { getOption } = require('./ConfigManager');
    const installations = config.getOption("profiles");
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
        installation.resolution = {
            width: installation.resolution.width ?? getOption('minecraft.launch.width'),
            height: installation.resolution.height ?? getOption('minecraft.launch.height'),
            fullscreen: installation.resolution.fullscreen ?? getOption('minecraft.launch.fullscreen'),
        };
        return installation;
    }
    return undefined;
}

/**
 * Delete the installation with given hash
 * @param {String} hash - The hash of the installation
 * @param {Boolean} forceDeps - Should we delete all dependencies
 * @returns {Boolean} - Whether the deletion is success
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

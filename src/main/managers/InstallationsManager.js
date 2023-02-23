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

exports.load = function (dir_path) {
    return config.load(dir_path);
}

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
    options = Object.assign({ // reassign
        created: current_date,
        icon: undefined,
        type: 'custom',
        gameDir: undefined,
        javaPath: undefined,
        javaArgs: undefined,
        lastUsed: undefined,
        lastVersionId: undefined,
        name: undefined,
        resolution: {
            width: undefined,
            height: undefined,
        },
        checkHash: true,
    }, options);
    const profile = cleanObject(options);

    const installations = config.getOption("profiles");
    if (profile) {
        const version_id = generateIdFor(installations);
        Object.assign(installations, {
            [version_id]: cleanObject(profile)
        });
        return config.setOption("profiles", installations);
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
    const installations = config.getOption("profiles");
    if (hash && Object(installations).hasOwnProperty(hash))
        return { hash: hash, ...installations[hash] };
    return undefined;
}

/**
 * Delete the installation with given hash
 * @param {String} hash - The hash of the installation
 * @returns {Boolean} - Whether the deletion is success
 */
exports.removeInstallation = async function (hash) {
    const installations = config.getOption("profiles");
    if (hash && Object(installations).hasOwnProperty(hash)) {
        delete installations[hash];
        return config.setOption("profiles", installations);
    }
    return undefined;
}

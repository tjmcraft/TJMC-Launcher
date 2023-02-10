const fs = require('fs')
const path = require('path')

const { cleanObject } = require('../util/Tools');
const { generateIdFor } = require('../util/Random');

const logger = require('../util/loggerutil')('%c[InstallationsManager]', 'color: #0066d6; font-weight: bold')

/* ============= INSTALLATIONS ============= */

class Installations {

    /**
     * Current manifest path
     */
    manifest_path = undefined;

    /**
     * Current manifest
     */
    parsed_manifest = {};

    constructor(params = {}) {
        this.params = params;
    }

    /**
     * Load installations manifest from directory
     * @param {String} dir_path - path to directory where installation manifest is stored
     * @returns {Boolean} true if manifest is loaded
     */
    load(dir_path) {
        if (!dir_path) return;
        this.manifest_path = path.join(dir_path, `launcher-profiles.json`);
        if (!fs.existsSync(this.manifest_path)) this.createEmpty();
        const file = fs.readFileSync(this.manifest_path);
        if (file.length < 1) this.createEmpty();
        this.parsed_manifest = JSON.parse(fs.readFileSync(this.manifest_path));
        return true;
    }

    /**
     * Get current (loaded) manifest
     */
    get get() {
        return this.parsed_manifest || null;
    }

    /**
     * Add new profile to manifest
     * @param {Object} profile - profile object
     * @param {String} id - id of installation
     * @returns {String | Boolean} - hash of the created installation or false if failed
     */
    add(profile, id = null) {
        let version_id = id || generateIdFor(this.parsed_manifest.profiles);
        if (profile) {
            Object.assign(this.parsed_manifest.profiles, {
                [version_id]: cleanObject(profile)
            });
        }
        return (this.params.auto_save && this.save()) && version_id;
    }

    /**
     * Remove profile from manifest
     * @param {String} profile_id - profile id to remove
     * @returns {Boolean} - true if profile was removed
     */
    remove(profile_id) {
        if (profile_id && Object(this.parsed_manifest.profiles).hasOwnProperty(profile_id)) {
            delete this.parsed_manifest.profiles[profile_id];
        }
        return (this.params.auto_save && this.save()) || true;
    }

    /**
     * Set installations to current manifest and save
     * @param {Object} profiles - current profiles
     * @returns
     */
    set(profiles) {
        this.parsed_manifest.profiles = cleanObject(profiles);
        return (this.params.auto_save && this.save()) || true;
    }

    createEmpty() {
        this.parsed_manifest = {
            tjmcVersion: '1.0.0',
            profiles: {},
        }
        return (this.params.auto_save && this.save()) || true;
    }

    /**
     * Save current profile
     * @returns {Boolean} - true if success
     */
    save() {
        fs.writeFileSync(this.manifest_path, JSON.stringify(this.parsed_manifest, null, 4));
        logger.debug('Installation profile saved!');
        this.load();
        return true;
    }
}

const installations = new Installations({ auto_save: true })

exports.load = function (dir_path) {
    return installations.load(dir_path);
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
    options = Object.assign({}, { // reassign
        created: current_date,
        gameDir: undefined,
        icon: undefined,
        javaArgs: undefined,
        javaPath: undefined,
        lastUsed: undefined,
        lastVersionId: undefined,
        name: undefined,
        resolution: {
            width: undefined,
            height: undefined,
        },
        type: 'custom'
    }, options);
    cleanObject(options);
    return installations.add(options); // returns hash (dont need)
}

exports.getInstallations = async function () {
    return installations.get.profiles || undefined;
}

/**
 * Returns the installation with the given hash
 * @param {*} hash - The hash of the installation
 * @returns {Object} - The installation's object
 */
exports.getInstallation = async function (hash) {
    if (hash && Object(installations.get.profiles).hasOwnProperty(hash))
        return { hash: hash, ...installations.get.profiles[hash] };
    return undefined;
}

/**
 * Returns the installation with the given hash (SYNC)
 * @param {*} hash - The hash of the installation
 * @returns {Object} - The installation's object
 */
exports.getInstallationSync = function (hash) {
    if (hash && Object(installations.get.profiles).hasOwnProperty(hash))
        return { hash: hash, ...installations.get.profiles[hash] };
    return undefined;
}

/**
 * Delete the installation with given hash
 * @param {String} hash - The hash of the installation
 * @returns {Boolean} - Whether the deletion is success
 */
exports.removeInstallation = async function (hash) {
    return installations.remove(hash);
}

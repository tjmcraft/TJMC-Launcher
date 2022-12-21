const fs = require('fs')
const path = require('path')

const { randomString, cleanObject } = require('../util/Tools');

const logger = require('../util/loggerutil')('%c[InstallationsManager]', 'color: #0066d6; font-weight: bold')

/* ============= INSTALLATIONS ============= */

class Installations {
    manifest_path = undefined;
    constructor(params = {}) {
        this.params = params;
    }
    load(dir_path) {
        if (!dir_path) return;
        this.manifest_path = path.join(dir_path, `launcher-profiles.json`);
        if (!fs.existsSync(this.manifest_path)) this.createEmpty();
        const file = fs.readFileSync(this.manifest_path);
        if (file.length < 1) this.createEmpty();
        this.parsed_manifest = JSON.parse(fs.readFileSync(this.manifest_path));
        return true;
    }
    get get() {
        return this.parsed_manifest || null;
    }
    add(profile, id = null) {
        let version_id = id || randomString(32);
        if (profile && !Object(this.parsed_manifest.profiles).hasOwnProperty(version_id)) {
            this.parsed_manifest.profiles[version_id] = cleanObject(profile);
        } else { throw new Error("RND Mismatch") }
        (this.params.auto_save && this.save()) || true;
        return version_id;
    }
    remove(profile_id) {
        if (profile_id && Object(this.parsed_manifest.profiles).hasOwnProperty(profile_id)) {
            delete this.parsed_manifest.profiles[profile_id];
        }
        return (this.params.auto_save && this.save()) || true;
    }
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
 * @param {String} version - Version identifier
 * @param {Object} options - Options for version
 * @param {Object} options.name - Name of the version
 * @param {Object} options.type - Type of the version
 * @param {Object} options.gameDir - Directory of the version
 * @param {Object} options.javaPath - Path to executable java file
 * @param {Object} options.javaArgs - Arguments for java machine
 * @param {Object} options.resolution - Resolution of the game window
 * @param {Object} options.resolution.width - Width of the game window
 * @param {Object} options.resolution.height - Height of the game window
 */
exports.createInstallation = async function (options = {}) {
    const current_date = new Date().toISOString();
    let new_profile = Object.assign({}, {
        created: current_date,
        gameDir: undefined,
        icon: undefined,
        javaArgs: undefined,
        javaPath: undefined,
        lastUsed: undefined,
        lastVersionId: undefined,
        name: undefined,
        resolution: {
            width: options.resolution?.width <= 0 ? 854 : options.resolution?.width,
            height: options.resolution?.height <= 0 ? 480 : options.resolution?.height
        },
        type: 'custom'
    }, options);
    cleanObject(new_profile);
    return installations.add(new_profile);
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

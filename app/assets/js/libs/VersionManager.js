const fs = require('fs')
const path = require('path')
const ConfigManager = require('./ConfigManager')
const LoggerUtil = require('../loggerutil')
const request = require('request')
const { randomString, merge, cleanObject } = require('./Tools')
const logger = LoggerUtil('%c[VersionManager]', 'color: #0016d6; font-weight: bold')

exports.getLocalVersions = async function() {
    const dir_path = getVersionsDirectory();
    let ver_list = []
    try {
        fs.readdirSync(dir_path)?.forEach(folder => {
            const ver_path = path.join(dir_path, folder, folder + '.json')
            if (fs.existsSync(ver_path)){
                const file_c = JSON.parse(fs.readFileSync(ver_path, 'utf8'))
                let version = {
                    name: file_c?.name || file_c?.id,
                    id: file_c?.id,
                    type: file_c?.type,
                    time: file_c?.time,
                    releaseTime: file_c?.releaseTime,
                    gameDir: file_c?.gameDir,
                    javaPath: file_c?.javaPath,
                    javaArgs: file_c?.javaArgs,
                    resolution: file_c?.resolution
                }
                cleanObject(version);
                ver_list.push(version);
            }
        })
        return (ver_list)
    } catch (error) {
        logger.error("Error while parsing local versions: " + error)
        return
    }
}

exports.getVersion = async function() {
    return ConfigManager.getVersion()
}

exports.setVersion = function(v) {
    ConfigManager.setVersion(v)
}

/**
 * Gets Main JSON of given version
 * @param version Version of Minecraft
 */
exports.getVersionManifest = async function(version, props = {}) {
    logger.debug('Loading Version JSON for: ' + version);
    const versionPath = path.join(getVersionsDirectory(), version);
    const versionJsonPath = path.join(versionPath, `${version}.json`);
    var c_version = null;
    if (fs.existsSync(versionJsonPath)) {
        c_version = JSON.parse(fs.readFileSync(versionJsonPath));
    } else {
        const parsed = await exports.getGlobalVersions();
        for (const cv in parsed) {
            if (parsed[cv].id === version) {
                c_version = JSON.parse(await downloadFile(parsed[cv].url || `https://tlauncher.ru/repo/versions/${version}.json`, true))
            }
        }
    }
    if (c_version.inheritsFrom) {
        const inherit = await exports.getVersionManifest(c_version.inheritsFrom);
        c_version.libraries = merge(c_version.libraries, inherit.libraries);
        c_version.mainClass = c_version.mainClass || inherit.mainClass;
        c_version.minecraftArguments = c_version.minecraftArguments || inherit.minecraftArguments;
        c_version.assetIndex = c_version.assetIndex || inherit.assetIndex;
        c_version.downloads = c_version.downloads || inherit.downloads;
        if (c_version.arguments || inherit.arguments){
            c_version.arguments.game = c_version.arguments.game && inherit.arguments.game ? merge(c_version.arguments.game, inherit.arguments.game) : c_version.arguments.game || inherit.arguments.game
            c_version.arguments.jvm = c_version.arguments.jvm && inherit.arguments.jvm ? merge(c_version.arguments.jvm, inherit.arguments.jvm) : c_version.arguments.jvm || inherit.arguments.jvm
        }
        delete c_version.inheritsFrom;
    }
    c_version = Object.assign(c_version, props);
    fs.mkdirSync(versionPath, { recursive: true });
    fs.writeFileSync(versionJsonPath, JSON.stringify(c_version, null, 4));
    return c_version
}

exports._createInstallation = async function (version, options) {
    logger.debug("Creating installation configuration for version " + version);
    await exports.getVersionManifest(version, {
        name: options.name || version || undefined,
        gameDir: options.gameDir || undefined,
        resolution: {
            width: options.resolution?.width <= 0 ? 854 : options.resolution?.width,
            height: options.resolution?.height <= 0 ? 480 : options.resolution?.height
        },
        javaPath: options.javaPath || undefined,
        javaArgs: options.javaArgs || undefined
    })
}

exports.removeVersion = async function(version) {
    const versionFile = await exports.getVersionManifest(version)
    const versionPath = path.join(getVersionsDirectory(), version)
    const assetsIndexDir = path.join(ConfigManager.getDataDirectory(), 'assets', 'indexes', `${versionFile.assetIndex.id}.json`)
    fs.rmdirSync(versionPath, {recursive: true})
    fs.rmdirSync(assetsIndexDir, {recursive: true})
    logger.log(`${version} was removed!`)
}


/* ============= GLOBAL ============= */

exports.getGlobalVersionsManifests = async function () {
    let m = JSON.parse(await downloadFile(`https://launchermeta.mojang.com/mc/game/version_manifest.json`, true)),
        t = JSON.parse(await downloadFile(`https://tlauncher.ru/repo/versions/versions.json`, true))
    return merge(m.versions, t.versions)
}

exports.updateGlobalVersionsConfig = async function() {
    const dir_path = getVersionsDirectory();
    const manifest_path = path.join(dir_path, `version_manifest_v2.json`);
    const versions = await this.getGlobalVersionsManifests();
    fs.writeFileSync(manifest_path, JSON.stringify(versions, null, 4));
    
}

exports.getGlobalVersions = async function () {
    const dir_path = getVersionsDirectory();
    const manifest_path = path.join(dir_path, `version_manifest_v2.json`);
    if (!fs.existsSync(manifest_path)) await exports.updateGlobalVersionsConfig();
    const versions = JSON.parse(fs.readFileSync(manifest_path));
    return versions;
}

exports.getGlobalVersion = async function (version) {
    const versions = await exports.getGlobalVersions();
    return versions.find(e => e.id === version) || undefined;
}

/* ================================== */


/* ============= INSTALLATIONS ============= */

class Installations {
    constructor(params = {}) {
        this.params = params;
        this.manifest_path = path.join(this.params.dir_path, `launcher_profiles.json`);
        this.load();
    }
    load() {
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

const installations = new Installations({ auto_save: true, dir_path: getVersionsDirectory() })

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
exports.createInstallation = async function (version, options) {
    const current_date = new Date().toISOString();
    let new_profile = {
        created: current_date,
        gameDir: options.gameDir || undefined,
        icon: undefined,
        javaArgs: options.javaArgs || undefined,
        javaPath: options.javaPath || undefined,
        lastUsed: undefined,
        lastVersionId: version || undefined,
        name: options.name || version || undefined,
        resolution: {
            width: options.resolution?.width <= 0 ? 854 : options.resolution?.width,
            height: options.resolution?.height <= 0 ? 480 : options.resolution?.height
        },
        type: options.type || 'custom' || undefined
    };
    cleanObject(new_profile);
    return installations.add(new_profile);
}

exports.getInstallations = async function () {
    return installations.get.profiles || null;
}

/**
 * Returns the installation with the given hash
 * @param {*} hash - The hash of the installation
 * @returns {Object} - The installation's object
 */
exports.getInstallation = async function (hash) {
    if (hash && Object(installations.get.profiles).hasOwnProperty(hash))
        return { hash: hash, ...installations.get.profiles[hash] } || null;
}

/**
 * Returns the installation with the given hash (SYNC)
 * @param {*} hash - The hash of the installation
 * @returns {Object} - The installation's object
 */
exports.getInstallationSync = function (hash) {
    if (hash && Object(installations.get.profiles).hasOwnProperty(hash))
        return { hash: hash, ...installations.get.profiles[hash] } || null;
}

/**
 * Delete the installation with given hash
 * @param {String} hash - The hash of the installation
 * @returns {Boolean} - Whether the deletion is success
 */
exports.removeInstallation = async function (hash) {
    return installations.remove(hash);
}

exports.getSelectedInstallation = async function () {
    const v = ConfigManager.getVersion()
    const i = await exports.getInstallation(v)
    return i || null;
}

/* ========================================= */


/**
 * Function just download a single file and return its body
 * @param url give url of file
 */
function downloadFile(url, retry = false) {
    return new Promise((resolve, reject) => {
        request(url, async (error, response, body) => {
            if (error) {
                logger.debug(`Failed to download ${url} due to\n${error}.`+` Retrying... ${retry}`)
                if (retry) {await downloadFile(url, false)} else reject(error);
            } else 
            if (response?.statusCode != 200) {
                reject('Invalid status code <' + response.statusCode + '>')
            } else resolve(body)
        })
    })
}

function getVersionsDirectory() {
    const dir_path = ConfigManager.getVersionsDirectory();
    if (!fs.existsSync(dir_path)) {
        logger.log('Attempting to create versions folder');
        fs.mkdirSync(dir_path, { recursive: true });
    }
    return dir_path;
}
const fs = require('fs')
const path = require('path')

const { merge, cleanObject } = require('../util/Tools')
const { downloadFile } = require('../util/download')

const logger = require('../util/loggerutil')('%c[VersionManager]', 'color: #0016d6; font-weight: bold')

var versions_directory = undefined;

/**
 * Get Local versions (based on dirs/manifests)
 * @deprecated
 * @returns {Array<object>}
 */
exports.getLocalVersions = async function () {
    if (!versions_directory) return;
    let ver_list = []
    try {
        fs.readdirSync(versions_directory)?.forEach(folder => {
            const ver_path = path.join(versions_directory, folder, folder + '.json')
            if (fs.existsSync(ver_path)) {
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

/**
 * Gets Main JSON of given version
 * @param {String} version - Version of Minecraft
 */
exports.getVersionManifest = async function (version, props = {}, progressHandler = (e) => void 0) {
    logger.debug(`Loading ${version} version manifest...`);
    if (!versions_directory) return;
    const versionPath = path.join(versions_directory, version);
    const versionJsonPath = path.join(versionPath, `${version}.json`);
    var c_version = null;
    if (fs.existsSync(versionJsonPath)) {
        c_version = JSON.parse(fs.readFileSync(versionJsonPath));
    } else {
        const parsed = await this.getGlobalVersions();
        const cvv = parsed.find(v => v.id == version);
        c_version = await downloadFile(cvv.url ?? `https://tlaun.ch/repo/versions/${version}.json`, progressHandler);
    }
    if (c_version.inheritsFrom) {
        const inherit = await this.getVersionManifest(c_version.inheritsFrom);
        c_version.mainClass = c_version.mainClass || inherit.mainClass;
        c_version.libraries = merge(c_version.libraries, inherit.libraries);
        c_version.downloads = c_version.downloads || inherit.downloads;
        c_version.assetIndex = c_version.assetIndex || inherit.assetIndex;
        c_version.javaVersion = c_version.javaVersion || inherit.javaVersion;
        c_version.minecraftArguments = c_version.minecraftArguments || inherit.minecraftArguments;
        if (c_version.arguments || inherit.arguments) {
            c_version.arguments.game = c_version.arguments.game && inherit.arguments.game ? merge(c_version.arguments.game, inherit.arguments.game) : c_version.arguments.game || inherit.arguments.game
            c_version.arguments.jvm = c_version.arguments.jvm && inherit.arguments.jvm ? merge(c_version.arguments.jvm, inherit.arguments.jvm) : c_version.arguments.jvm || inherit.arguments.jvm
        }
        delete c_version.inheritsFrom;
    }
    c_version = Object.assign(c_version, props);
    fs.mkdirSync(versionPath, { recursive: true });
    fs.writeFileSync(versionJsonPath, JSON.stringify(c_version, null, 2));
    return c_version
}

exports.removeVersion = async function (version) {
    if (!versions_directory) return;
    const versionFile = await this.getVersionManifest(version)
    const versionPath = path.join(versions_directory, version)
    const assetsIndexDir = path.join(ConfigManager.getDataDirectory(), 'assets', 'indexes', `${versionFile.assetIndex.id}.json`)
    fs.rmdirSync(versionPath, { recursive: true })
    fs.rmdirSync(assetsIndexDir, { recursive: true })
    logger.log(`${version} was removed!`)
}


/* ============= GLOBAL ============= */

/**
 *
 * @returns {Promise<Array<object>>}
 */
exports.getGlobalVersionsManifests = async function () {
    let [mojang_versions, tlaunch_versions] = await Promise.all([
        downloadFile(`https://launchermeta.mojang.com/mc/game/version_manifest.json`),
        downloadFile(`https://tlaun.ch/repo/versions/versions.json`)
    ]);
    mojang_versions = mojang_versions.versions || [];
    tlaunch_versions = tlaunch_versions.versions || [];
    const versions = merge(mojang_versions, tlaunch_versions);
    return versions.sort((a,b) => new Date(b.releaseTime) - new Date(a.releaseTime));
}

exports.updateGlobalVersionsConfig = async function () {
    if (!versions_directory) return;
    const manifest_path = path.join(versions_directory, `version_manifest_v2.json`);
    const versions = await this.getGlobalVersionsManifests();
    fs.writeFileSync(manifest_path, JSON.stringify(versions, null, 4));
    return versions;
}

exports.getGlobalVersions = async function () {
    if (!versions_directory) return;
    const manifest_path = path.join(versions_directory, `version_manifest_v2.json`);
    if (!fs.existsSync(manifest_path)) await this.updateGlobalVersionsConfig();
    const versions = JSON.parse(fs.readFileSync(manifest_path));
    return versions;
}

exports.getGlobalVersion = async function (version) {
    const versions = await this.getGlobalVersions();
    return versions.find(e => e.id === version) || undefined;
}

/* ================================== */

exports.load = function (ver_path) {
    if (!fs.existsSync(ver_path)) fs.mkdirSync(ver_path, { recursive: true });
    versions_directory = ver_path;
    this.updateGlobalVersionsConfig();
    return true;
}
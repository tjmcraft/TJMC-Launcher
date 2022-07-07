const fs = require('fs')
const path = require('path')
const ConfigManager = require('./ConfigManager')
const LoggerUtil = require('../util/loggerutil')
const request = require('request')
const { merge, cleanObject } = require('../util/Tools')
const logger = LoggerUtil('%c[VersionManager]', 'color: #0016d6; font-weight: bold')

exports.getLocalVersions = async function () {
    const dir_path = getVersionsDirectory();
    let ver_list = []
    try {
        fs.readdirSync(dir_path)?.forEach(folder => {
            const ver_path = path.join(dir_path, folder, folder + '.json')
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
 * @param version Version of Minecraft
 */
exports.getVersionManifest = async function (version, props = {}) {
    logger.debug('Loading Version JSON for: ' + version);
    const versionPath = path.join(getVersionsDirectory(), version);
    const versionJsonPath = path.join(versionPath, `${version}.json`);
    var c_version = null;
    if (fs.existsSync(versionJsonPath)) {
        c_version = JSON.parse(fs.readFileSync(versionJsonPath));
    } else {
        const parsed = await this.getGlobalVersions();
        for (const cv in parsed) {
            if (parsed[cv].id === version) {
                c_version = JSON.parse(await downloadFile(parsed[cv].url || `https://tlauncher.ru/repo/versions/${version}.json`, true))
            }
        }
    }
    if (c_version.inheritsFrom) {
        const inherit = await this.getVersionManifest(c_version.inheritsFrom);
        c_version.libraries = merge(c_version.libraries, inherit.libraries);
        c_version.mainClass = c_version.mainClass || inherit.mainClass;
        c_version.minecraftArguments = c_version.minecraftArguments || inherit.minecraftArguments;
        c_version.assetIndex = c_version.assetIndex || inherit.assetIndex;
        c_version.downloads = c_version.downloads || inherit.downloads;
        if (c_version.arguments || inherit.arguments) {
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

exports.removeVersion = async function (version) {
    const versionFile = await this.getVersionManifest(version)
    const versionPath = path.join(getVersionsDirectory(), version)
    const assetsIndexDir = path.join(ConfigManager.getDataDirectory(), 'assets', 'indexes', `${versionFile.assetIndex.id}.json`)
    fs.rmdirSync(versionPath, { recursive: true })
    fs.rmdirSync(assetsIndexDir, { recursive: true })
    logger.log(`${version} was removed!`)
}


/* ============= GLOBAL ============= */

exports.getGlobalVersionsManifests = async function () {
    let m = JSON.parse(await downloadFile(`https://launchermeta.mojang.com/mc/game/version_manifest.json`, true)),
        t = JSON.parse(await downloadFile(`https://tlaun.ch/repo/versions/versions.json`, true))
    return merge(m.versions, t.versions)
}

exports.updateGlobalVersionsConfig = async function () {
    const dir_path = getVersionsDirectory();
    const manifest_path = path.join(dir_path, `version_manifest_v2.json`);
    const versions = await this.getGlobalVersionsManifests();
    fs.writeFileSync(manifest_path, JSON.stringify(versions, null, 4));

}

exports.getGlobalVersions = async function () {
    const dir_path = getVersionsDirectory();
    const manifest_path = path.join(dir_path, `version_manifest_v2.json`);
    if (!fs.existsSync(manifest_path)) await this.updateGlobalVersionsConfig();
    const versions = JSON.parse(fs.readFileSync(manifest_path));
    return versions;
}

exports.getGlobalVersion = async function (version) {
    const versions = await this.getGlobalVersions();
    return versions.find(e => e.id === version) || undefined;
}

/* ================================== */

/* ========================================= */


/**
 * Function just download a single file and return its body
 * @param url give url of file
 */
function downloadFile(url, retry = false) {
    return new Promise((resolve, reject) => {
        request(url, async (error, response, body) => {
            if (error) {
                logger.debug(`Failed to download ${url} due to\n${error}.` + ` Retrying... ${retry}`)
                if (retry) { await downloadFile(url, false) } else reject(error);
            } else if (response?.statusCode != 200) {
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
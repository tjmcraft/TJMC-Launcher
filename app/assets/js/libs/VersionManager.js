const fs = require('fs')
const path = require('path')
const ConfigManager = require('./ConfigManager')
const LoggerUtil = require('../loggerutil')
const request = require('request')
const logger = LoggerUtil('%c[VersionManager]', 'color: #0016d6; font-weight: bold')

exports.getLocalVersions = async function() {
    let dir_path = API.ConfigManager.getVersionsDirectory()
    let ver_list = []
    try {
        if (!fs.existsSync(dir_path)) {
            logger.log('Attempting to create versions folder')
            fs.mkdirSync(dir_path, {recursive: true})
        }
        fs.readdirSync(dir_path)?.forEach(folder => {
            let ver_path = path.join(dir_path, folder, folder + '.json')
            if (fs.existsSync(ver_path)){
                let file_c = JSON.parse(fs.readFileSync(ver_path, 'utf8'))
                let version =  {
                    id: file_c.id,
                    type: file_c.type,
                    time: file_c.time,
                    releaseTime: file_c.releaseTime
                }
                ver_list.push(version)
            }
        })
        return (ver_list)
    } catch (error) {
        logger.error("Error while parsing local versions: " + error)
        return
    }
}

exports.getGlobalVersions = async function() {
    let m = JSON.parse(await downloadFile(`https://launchermeta.mojang.com/mc/game/version_manifest.json`, true)),
        t = JSON.parse(await downloadFile(`https://tlauncher.ru/repo/versions/versions.json`, true))
    return merge(m.versions, t.versions)
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
    const versionPath = path.join(ConfigManager.getVersionsDirectory(), version);
    const versionJsonPath = path.join(versionPath, `${version}.json`);
    var c_version = null;
    if (fs.existsSync(versionJsonPath)) {
        c_version = JSON.parse(fs.readFileSync(versionJsonPath));
    } else {
        const parsed = await this.getGlobalVersions()
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
    fs.writeFileSync(versionJsonPath, JSON.stringify(c_version));
    return c_version
}

exports.createInstallation = async function (version, options) {
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
    const versionPath = path.join(ConfigManager.getVersionsDirectory(), version)
    const assetsIndexDir = path.join(ConfigManager.getDataDirectory(), 'assets', 'indexes', `${versionFile.assetIndex.id}.json`)
    fs.rmdirSync(versionPath, {recursive: true})
    fs.rmdirSync(assetsIndexDir, {recursive: true})
    logger.log(`${version} was removed!`)
}

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
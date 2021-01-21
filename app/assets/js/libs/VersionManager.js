const fs = require('fs')
const path = require('path')
const ConfigManager = require('./ConfigManager')
const LoggerUtil = require('../loggerutil')
const logger = LoggerUtil('%c[VersionManager]', 'color: #0016d6; font-weight: bold')

exports.getLocalVersions = async function() {
    let dir_path = API.ConfigManager.getVersionsDirectory()
    let ver_list = []
    fs.readdirSync(dir_path).forEach(folder => {
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
}

exports.getGlobalVersions = async function() {
    let m = JSON.parse(await API.downloadFile(`https://launchermeta.mojang.com/mc/game/version_manifest.json`)),
        t = JSON.parse(await API.downloadFile(`http://u.tlauncher.ru/repo/versions/versions.json`))
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
exports.getVersionManifest = async function(version) {
    logger.debug('Loading Version JSON for: '+version)
    let options = ConfigManager.getAllOptions()
    const versionJsonPath = path.join(options.overrides.path.directory, version, `${version}.json`)
    var c_version = null;
    if (fs.existsSync(versionJsonPath)) {
        c_version = JSON.parse(fs.readFileSync(versionJsonPath)) 
    } else {
        const parsed = await this.getGlobalVersions()
        for (const cv in parsed) {
            if (parsed[cv].id === version) {
                    c_version = JSON.parse(await API.downloadFile(parsed[cv].url || `http://u.tlauncher.ru/repo/versions/${version}.json`))
            }
        }
    }
    if (c_version.inheritsFrom) {
        const inherit = await exports.getVersionManifest(c_version.inheritsFrom)
        c_version.libraries = merge(c_version.libraries, inherit.libraries)
        c_version.mainClass = c_version.mainClass ?? inherit.mainClass
        c_version.minecraftArguments = c_version.minecraftArguments ?? inherit.minecraftArguments
        c_version.assetIndex = c_version.assetIndex ?? inherit.assetIndex
        c_version.downloads = c_version.downloads ?? inherit.downloads
        if (c_version.arguments || inherit.arguments){
            c_version.arguments.game = c_version.arguments.game && inherit.arguments.game ? merge(c_version.arguments.game, inherit.arguments.game) : c_version.arguments.game ?? inherit.arguments.game
            c_version.arguments.jvm = c_version.arguments.jvm && inherit.arguments.jvm ? merge(c_version.arguments.jvm, inherit.arguments.jvm) : c_version.arguments.jvm ?? inherit.arguments.jvm
        }
        delete c_version.inheritsFrom
    }
    fs.mkdirSync(path.join(options.overrides.path.directory, version), {recursive: true})
    fs.writeFileSync(versionJsonPath, JSON.stringify(c_version))
    return c_version
}

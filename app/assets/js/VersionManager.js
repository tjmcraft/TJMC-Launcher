const fs = require('fs')
const path = require('path')

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
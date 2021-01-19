const fs = require('fs')
const path = require('path')
const request = require('request')

class VersionManager {
    constructor() {

    }
    async getLocalVersions() {
        let dir_path = API.ConfigManager.getVersionsDirectory()
            fs.readdir(dir_path, (err, _folder) => {
                _folder.forEach(folder => {
                let ver_path = path.join(dir_path, folder, folder + '.json')
                if (fs.existsSync(ver_path)){
                    let file_c = JSON.parse(fs.readFileSync(ver_path, 'utf8'))
                    let version =  {
                        id: file_c.id,
                        type: file_c.type,
                        time: file_c.time,
                        releaseTime: file_c.releaseTime
                    }
                    console.debug(version)
                    return version
                }
            })
        })
    }
    
    async getVersionManifest () {
        let m = await this.getMVM(),
            t = await this.getTVM()
        return merge(m.versions, t.versions)
    }
    async getMVM (){
        return new Promise(resolve => {
            request.get(`https://launchermeta.mojang.com/mc/game/version_manifest.json`, (error, response, body) => {
                if (error) resolve(error)
                const parsed = JSON.parse(body)
                return resolve(parsed)
            })
        })
    }
    async getTVM (){
        return new Promise(resolve => {
            request.get(`http://u.tlauncher.ru/repo/versions/versions.json`, (error, response, body) => {
                if (error) resolve(error)
                const parsed = JSON.parse(body)
                return resolve(parsed)
            })
        })
    }
}

module.exports = VersionManager
const uiCore = require('./uicore')
const ConfigManager = require('./ConfigManager')
const { shell } = require('electron')
const fs = require('fs')
const path = require('path')
const launcher = require('./launcher')
const logger        = require('./loggerutil')('%c[Preloader]', 'color: #a02d2a; font-weight: bold')

logger.log('Loading..')

// Load ConfigManager
ConfigManager.load()

// Init global instances
process.once('loaded', () => {
    global.API = {
        ConfigManager: ConfigManager,
        getLocalVersions: getLocalVersions,
        launcher: launcher,
        startMine: startMine,
        getOS: getOS,
        shell: shell
    }
})

function getLocalVersions() {
    let dir_path = API.ConfigManager.getVersionsDirectory()
    let versions = []
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
            console.debug(version)
            versions.push(version)
        }
    })
    return versions
}

function getOS() {
    switch (process.platform) {
        case 'win32': return 'windows'
        case 'darwin': return 'osx'
        case 'linux': return 'linux'
        default: return 'unknown_os'
    }
}

function startMine () {
    let _launcher = new launcher(ConfigManager.getAllOptions())
    _launcher.on('progress', (e) => {
        progressBar.setValue((e.task/e.total)*100)
    })
    _launcher.on('download-status', (e) => {
        if (e.type == 'version-jar') {progressBar.setValue((e.current/e.total)*100)}
    })
    topBar.toggle(true)
    _launcher.construct().then((minecraftArguments) =>
        _launcher.createJVM(minecraftArguments).then((e) => {
            topBar.toggle(false)
        })
    )
}
const uiCore = require('./uicore')
const ConfigManager = require('./ConfigManager')
const { shell } = require('electron')
const VersionManager = require('./VersionManager')
const launcher = require('./launcher')
const logger        = require('./loggerutil')('%c[Preloader]', 'color: #a02d2a; font-weight: bold')

logger.log('Loading..')

// Load ConfigManager
ConfigManager.load()

// Init global instances
process.once('loaded', () => {
    global.API = {
        ConfigManager: ConfigManager,
        VersionManager: VersionManager,
        launcher: launcher,
        startMine: startMine,
        getOS: getOS,
        shell: shell
    }
})

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
const uiCore = require('./uicore')
const ConfigManager = require('./ConfigManager')
const { shell } = require('electron')
const logger        = require('./loggerutil')('%c[Preloader]', 'color: #a02d2a; font-weight: bold')

logger.log('Loading..')

// Load ConfigManager
ConfigManager.load()

// Init global instances
process.once('loaded', () => {
    global.API = {
        Message: require('./message'),
        getOS: require('./Tools').getOS,
        shell: shell
    }
})
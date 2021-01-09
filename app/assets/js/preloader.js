const uiCore = require('./uicore')
const animation = require('./libs/Animation')
const ConfigManager = require('./ConfigManager')
const appLayers = require('./appLayers')
const logger        = require('./loggerutil')('%c[Preloader]', 'color: #a02d2a; font-weight: bold')

logger.log('Loading..')

// Load ConfigManager
ConfigManager.load()
process.once('loaded', () => {
    global.APP_LAYERS = appLayers
})
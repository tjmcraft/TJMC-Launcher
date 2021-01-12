const uiCore = require('./uicore')
const animation = require('./libs/Animation')
const ConfigManager = require('./ConfigManager')
const logger        = require('./loggerutil')('%c[Preloader]', 'color: #a02d2a; font-weight: bold')

logger.log('Loading..')

// Load ConfigManager
ConfigManager.load()

// Init global instances
process.once('loaded', () => {
    global.Message = require('./message')
})
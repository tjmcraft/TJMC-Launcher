const uiCore = require('./uicore')
const ConfigManager = require('./ConfigManager')
const FX = require('./libs/Animation')
const logger        = require('./loggerutil')('%c[Preloader]', 'color: #a02d2a; font-weight: bold')

logger.log('Loading..')

// Load ConfigManager
ConfigManager.load()
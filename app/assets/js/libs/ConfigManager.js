const fs = require('fs-extra')
const path = require('path')
const logg = require('../loggerutil')('%c[ConfigManager]', 'color: #1052a5; font-weight: bold')

const rootPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME)
const launcherDir = path.normalize((process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share"))+'/TJMC-Launcher') || require('electron').remote.app.getPath('userData')

const DEFAULT_CONFIG = 
{
    java: {
        javaPath: 'java',
        memory: {
            max: 1024,
            min: 512
        },
        detached: true,
        cwd: ''
    },
    launcher: {
        backgroundImage: ''
    },
    overrides: {
        request: {
            maxSockets: 32,
            timeout: 10000
        },
        path: {
            root: path.join(launcherDir, 'minecraft'),
            directory: path.join(launcherDir, 'minecraft', 'versions')
        }
    },
    minecraft: {
        launch: {
            fullscreen: false,
            width: 1280,
            height: 720
        }
    },
    version: {
        id: 'OptiFine 1.15.2',
        type: 'modified'
    },
    authorization: {
        access_token: 'null',
        name: 'MakAndJo',
        uuid: 'null',
        user_properties: ''
    }
}
//DEFAULT_CONFIG.path.version = path.join(DEFAULT_CONFIG.path.root, 'versions', DEFAULT_CONFIG.version.number)

let config = null

exports.getLauncherDirectory = function(){
    return launcherDir
}

exports.getDataDirectory = function(def = false){
    return def ? DEFAULT_CONFIG.overrides.path.root : config.overrides.path.root
}

exports.getVersionsDirectory = function(def = false){
    return def ? DEFAULT_CONFIG.overrides.path.directory : config.overrides.path.directory
}

const configPath = path.join(exports.getLauncherDirectory(), 'launcher-config.json')

exports.save = function(){
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'UTF-8')
}

exports.load = function(){
    let loaded = false
    if(!fs.existsSync(configPath)){
        fs.ensureDirSync(path.join(configPath, '..'))
        loaded = true
        config = DEFAULT_CONFIG
        exports.save()
    }
    if(!loaded){
        let Validate = false
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'UTF-8'))
            Validate = true
        } catch (err){
            logg.error(err)
            logg.log('Configuration file contains malformed JSON or is corrupt.')
            logg.log('Generating a new configuration file.')
            fs.ensureDirSync(path.join(configPath, '..'))
            config = DEFAULT_CONFIG
            exports.save()
        }
        if(Validate){
            config = validateKeySet(DEFAULT_CONFIG, config)
            exports.save()
        }
    }
    logg.log('Successfully Loaded Launcher Config')
}

function validateKeySet(srcObj, destObj){
    if(srcObj == null) srcObj = {}
    const keys = Object.keys(srcObj)
    for(let i=0; i<keys.length; i++){
        if(typeof destObj[keys[i]] === 'undefined'){
            destObj[keys[i]] = srcObj[keys[i]]
        } else if(typeof srcObj[keys[i]] === 'object' && srcObj[keys[i]] != null && !(srcObj[keys[i]] instanceof Array)){
            destObj[keys[i]] = validateKeySet(srcObj[keys[i]], destObj[keys[i]])
        }
    }
    return destObj
}

exports.isLoaded = function(){
    return config != null
}

exports.getAllOptions = function() {
    return config
}

exports.getVersion = function() {
    return config.version ?? DEFAULT_CONFIG.version
}

exports.setVersion = function(v) {
    config.version = (typeof v !== 'undefined' && v != null) ? v : DEFAULT_CONFIG.version
    exports.save()
}

/* =====================   Window Properties   ===================== */

const DEFAULT_WINDOW_CONFIG = {
    x: 0,
    y: 0,
    width: 1280,
    height: 720,
    isMaximized: false,
    isFullScreen: false
}

let windowStateConfigPath = path.join(exports.getLauncherDirectory(), 'window-config.json')
let windowConfig = null

exports.saveWindowState = function(){
    fs.writeFileSync(windowStateConfigPath, JSON.stringify(windowConfig, null, 4), 'UTF-8')
}

exports.loadWindowState = function(){
    let loaded = false
    if(!fs.existsSync(windowStateConfigPath)){
        fs.ensureDirSync(path.join(windowStateConfigPath, '..'))
        loaded = true
        windowConfig = DEFAULT_WINDOW_CONFIG
        exports.saveWindowState()
    }
    if(!loaded){
        let Validate = false
        try {
            windowConfig = JSON.parse(fs.readFileSync(windowStateConfigPath, 'UTF-8'))
            Validate = true
        } catch (err){
            logg.error(err)
            logg.log('Configuration file contains malformed JSON or is corrupt.')
            logg.log('Generating a new configuration file.')
            fs.ensureDirSync(path.join(windowStateConfigPath, '..'))
            windowConfig = DEFAULT_WINDOW_CONFIG
            exports.saveWindowState()
        }
        if(Validate){
            windowConfig = validateKeySet(DEFAULT_WINDOW_CONFIG, windowConfig)
            exports.saveWindowState()
        }
    }
    logg.log('Successfully Loaded Window Config')
}

exports.getWindowState = function() {
    return windowConfig
}

exports.setWindowState = function(state) {
    windowConfig = state
}
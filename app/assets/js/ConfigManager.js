const fs = require('fs-extra')
const path = require('path')
const logg = require('./loggerutil')('%c[ConfigManager]', 'color: #1052a5; font-weight: bold')

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
        backgroundImage: '',
        window: {
            x: 0,
            y: 0,
            width: 1280,
            height: 720,
            maximized: false,
            minimized: false,
            fullScreen: false
        }
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
        number: 'OptiFine 1.15.2',
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
    return def ? DEFAULT_CONFIG.path.root : config.path.root
}

const configPath = path.join(exports.getLauncherDirectory(), 'config.json')

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
    logg.log('Successfully Loaded')
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

/* =====================   Window Properties   ===================== */
exports.getWindowBounds = function() {
    return config.launcher.window
}

exports.getWindowPositionX = function() {
    return config.launcher.window.x
}

exports.getWindowPositionY = function() {
    return config.launcher.window.y
}

exports.getWindowWidth = function() {
    return config.launcher.window.width
}

exports.getWindowHeight = function() {
    return config.launcher.window.height
}

exports.getWindowFullScreen = function() {
    return config.launcher.window.fullScreen
}

exports.getWindowMaximized = function() {
    return config.launcher.window.maximized
}

exports.getWindowMinimized = function() {
    return config.launcher.window.minimized
}

exports.setWindowPosition = function(x, y) {
    config.launcher.window.x = x > 0 ? x : DEFAULT_CONFIG.launcher.window.x
    config.launcher.window.y = y > 0 ? y : DEFAULT_CONFIG.launcher.window.y
}

exports.setWindowSize = function(width, height) {
    config.launcher.window.width = Number.isInteger(width) && width > 1 ? width : DEFAULT_CONFIG.launcher.window.width
    config.launcher.window.height = Number.isInteger(height) && height > 1 ? height : DEFAULT_CONFIG.launcher.window.height
}

exports.setWindowFullScreen = function(fullScreen) {
    config.launcher.window.fullScreen = typeof fullScreen === 'boolean' ? fullScreen : DEFAULT_CONFIG.launcher.window.fullScreen
}

exports.setWindowMaximized = function(maximized) {
    config.launcher.window.maximized = typeof maximized === 'boolean' ? maximized : DEFAULT_CONFIG.launcher.window.maximized
}

exports.setWindowMinimized = function(minimized) {
    config.launcher.window.minimized = typeof minimized === 'boolean' ? minimized : DEFAULT_CONFIG.launcher.window.minimized
}

exports.getWindowState = function() {
    return config.launcher.window
}
exports.setWindowState = function(state) {
    config.launcher.window = state
}
const fs = require('fs-extra')
const path = require('path')
const os = require('os')
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
    auth: {
        access_token: 'null',
        username: 'MakAndJo',
        permission: 'Default',
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

exports.getAbsoluteMinRAM = function(){
    const mem = os.totalmem()/1024/1024
    return mem >= 5722 ? 2048 : 1024
}

exports.getAbsoluteMaxRAM = function(){
    const mem = os.totalmem()
    const gT16 = mem-16000000000
    return Math.floor((mem-1000000000-(gT16 > 0 ? (Number.parseInt(gT16/8) + 16000000000/4) : mem/4))/1000000000)*1024
}

function resolveMaxRAM(){
    const mem = os.totalmem()
    return Math.floor(mem/1024/1024)
}

function resolveMinRAM(){
    return resolveMaxRAM()
}

exports.getMinRAM = function(def = false){
    return !def ? config.java.memory.min : DEFAULT_CONFIG.java.memory.min
}

exports.setMinRAM = function(minRAM){
    config.java.memory.min = Math.floor(minRAM)
    exports.save()
}

exports.getMaxRAM = function(def = false){
    return !def ? config.java.memory.max : resolveMaxRAM()
}

exports.setMaxRAM = function(maxRAM){
    config.java.memory.max = Math.floor(maxRAM)
    exports.save()
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
    return config.version || DEFAULT_CONFIG.version
}

exports.setVersion = function(v) {
    config.version = (typeof v !== 'undefined' && v != null) ? v : DEFAULT_CONFIG.version
    exports.save()
}

exports.getAuth = async function() {
    return config.auth || DEFAULT_CONFIG.auth
}

exports.setAuth = function(a) {
    config.auth = (typeof a !== 'undefined' && a != null) ? a : DEFAULT_CONFIG.auth
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
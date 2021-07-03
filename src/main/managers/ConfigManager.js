const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const logg = require('../util/loggerutil')('%c[ConfigManager]', 'color: #1052a5; font-weight: bold')

const rootPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME)
const launcherDir = path.normalize((process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share"))+'/.tjmc') || require('electron').remote.app.getPath('userData')
const DEFAULT_CONFIG = 
{
    java: {
        javaPath: 'javaw',
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
        },
        checkHash: true
    },
    minecraft: {
        launch: {
            fullscreen: false,
            width: 1280,
            height: 720
        }
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

const configPath = path.join(exports.getLauncherDirectory(), 'launcher-config.json')

exports.save = function(reason = ""){
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'UTF-8')
    logg.debug('Config saved!' + (reason ? ` (${reason})` : ""))
}

exports.load = function(){
    let loaded = false
    if(!fs.existsSync(configPath)){
        fs.ensureDirSync(path.join(configPath, '..'))
        loaded = true
        config = DEFAULT_CONFIG
        exports.save('NEW')
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
            exports.save('ERROR_NEW')
        }
        if(Validate){
            config = validateKeySet(DEFAULT_CONFIG, config)
            exports.save('VALIDATE')
        }
    }
    logg.log('Load launcher config - success!')
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

exports.getAllOptionsSync = function () {
    return config
}

exports.getAllOptions = async function () {
    return config;
}

exports.setOptions = async (arg) => {
    Object.assign(config, arg);
    exports.save();return !0;
}

exports.getAuth = async function() {
    return config.auth || DEFAULT_CONFIG.auth
}

exports.setAuth = function(a) {
    config.auth = (typeof a !== 'undefined' && a != null) ? a : DEFAULT_CONFIG.auth
}

exports.setLaunchFullscreen = function (v = false) {
    config.minecraft.launch.fullscreen = (typeof v === 'boolean') ? v : false;
    exports.save();
}

exports.getLaunchFullscreen = function () {
    return config.minecraft.launch.fullscreen;
}
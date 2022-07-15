const fs = require('fs-extra');
const path = require('path');
const logg = require('../util/loggerutil')('%c[ConfigManager]', 'color: #1052a5; font-weight: bold');

const rootPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME);
const launcherDir = path.normalize((process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")) + '/.tjmc') || require('electron').remote.app.getPath('userData');
const configPath = path.join(launcherDir, 'launcher-config.json');

logg.debug("Config Path:", configPath);


/** 
 * Configuration
 * @type {DEFAULT_CONFIG} 
 */
var config = undefined;

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
        checkUpdates: true,
        disableHardwareAcceleration: false,
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
}
//DEFAULT_CONFIG.path.version = path.join(DEFAULT_CONFIG.path.root, 'versions', DEFAULT_CONFIG.version.number)

exports.getLauncherDirectory = () => launcherDir;
exports.getDataDirectory = (def = false) => def ? DEFAULT_CONFIG.overrides.path.root : config.overrides.path.root;
exports.getVersionsDirectory = (def = false) => def ? DEFAULT_CONFIG.overrides.path.directory : config.overrides.path.directory;

exports.save = (reason = "") => {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'UTF-8');
    logg.debug('Config saved!' + (reason ? ` (${reason})` : ""));
}

exports.load = () => {
    let loaded = false;
    if(!fs.existsSync(configPath)){
        fs.mkdirSync(path.join(configPath, '..'), { recursive: true });
        loaded = true;
        config = DEFAULT_CONFIG;
        exports.save('NEW');
    }
    if(!loaded){
        let Validate = false;
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
            Validate = true;
        } catch (err){
            logg.error(err);
            logg.log('Configuration file contains malformed JSON or is corrupt.');
            logg.log('Generating a new configuration file.');
            fs.mkdirSync(path.join(configPath, '..'), { recursive: true });
            config = DEFAULT_CONFIG;
            exports.save('ERROR_NEW');
        }
        if(Validate){
            config = validateKeySet(DEFAULT_CONFIG, config);
            exports.save('VALIDATE');
        }
    }
    logg.log('Load launcher config - success!');
}

function validateKeySet(srcObj, destObj){
    if (srcObj == null) srcObj = {};
    const keys = Object.keys(srcObj);
    for(let i=0; i<keys.length; i++){
        if(typeof destObj[keys[i]] === 'undefined'){
            destObj[keys[i]] = srcObj[keys[i]];
        } else if(typeof srcObj[keys[i]] === 'object' && srcObj[keys[i]] != null && !(srcObj[keys[i]] instanceof Array)){
            destObj[keys[i]] = validateKeySet(srcObj[keys[i]], destObj[keys[i]]);
        }
    }
    return destObj;
}

const boolHandler = (value, default_value) => typeof value === 'boolean' ? value : default_value;
const stringHandler = (value, default_value) => typeof value === 'string' ? value : default_value;
const objectHandler = (value, default_value) => typeof value === 'object' ? value : default_value;

exports.isLoaded = () => config != undefined;

exports.getAllOptionsSync = () => config;
exports.getAllOptions = async () => config;
exports.setOptions = async (options) => { config = Object.assign({}, config, objectHandler(options, DEFAULT_CONFIG)); exports.save(); }

exports.setLaunchFullscreen = (value) => { config.minecraft.launch.fullscreen = boolHandler(value, DEFAULT_CONFIG.minecraft.launch.fullscreen); exports.save(); }
exports.getLaunchFullscreen = () => !!config.minecraft.launch.fullscreen;

exports.getCheckUpdates = () => !!config.launcher.checkUpdates;
exports.setCheckUpdates = (value) => { config.launcher.checkUpdates = boolHandler(value, DEFAULT_CONFIG.launcher.checkUpdates); exports.save(); }

exports.getDisableHarwareAcceleration = () => !!config.launcher.disableHardwareAcceleration;
exports.setDisableHarwareAcceleration = (value) => { config.launcher.disableHardwareAcceleration = boolHandler(value, DEFAULT_CONFIG.launcher.disableHardwareAcceleration); exports.save(); }
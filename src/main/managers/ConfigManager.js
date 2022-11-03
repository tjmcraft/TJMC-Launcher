const fs = require('fs');
const path = require('path');

const logger = require('../util/loggerutil')('%c[ConfigManager]', 'color: #1052a5; font-weight: bold');

const rootPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME);
const launcherDir = path.normalize((process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")) + '/.tjmc') || require('electron').remote.app.getPath('userData');
const configPath = path.join(launcherDir, 'launcher-config.json');

logger.debug("Config Path:", configPath);

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
        hideOnClose: true,
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

const createDefaultConfig = () => {
    logger.debug('Generating a new configuration file.');
    fs.mkdirSync(path.join(configPath, '..'), { recursive: true });
    config = DEFAULT_CONFIG;
    exports.save("Create New Default");
}

exports.load = () => {
    if (!fs.existsSync(configPath)) createDefaultConfig();
    if (!this.isLoaded()) {
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
        } catch (err){
            logger.warn('Configuration file contains malformed JSON or is corrupt!');
            createDefaultConfig();
        }
        config = validateKeySet(DEFAULT_CONFIG, config);
        exports.save('VALIDATE');
    }
    logger.debug("Load launcher config", "=>", (this.isLoaded() ? 'success' : 'failure'));
}

exports.save = (reason = "") => {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'UTF-8');
    } catch (e) {
        logger.error('Config save error:', e)
    }
    logger.debug('Config saved!', (reason ? `(${reason})` : null));
    return config;
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

exports.getLauncherDirectory = () => launcherDir;
exports.getDataDirectory = (def = false) => def ? DEFAULT_CONFIG.overrides.path.root : config.overrides.path.root;
exports.getVersionsDirectory = (def = false) => def ? DEFAULT_CONFIG.overrides.path.directory : config.overrides.path.directory;

exports.getLaunchFullscreen = () => Boolean(config.minecraft.launch.fullscreen);
exports.setLaunchFullscreen = (value) => { config.minecraft.launch.fullscreen = boolHandler(value, DEFAULT_CONFIG.minecraft.launch.fullscreen); exports.save(); }

exports.getCheckUpdates = () => Boolean(config.launcher.checkUpdates);
exports.setCheckUpdates = (value) => { config.launcher.checkUpdates = boolHandler(value, DEFAULT_CONFIG.launcher.checkUpdates); exports.save(); }

exports.getDisableHardwareAcceleration = () => Boolean(config.launcher.disableHardwareAcceleration);
exports.setDisableHardwareAcceleration = (value) => { config.launcher.disableHardwareAcceleration = boolHandler(value, DEFAULT_CONFIG.launcher.disableHardwareAcceleration); exports.save(); }

exports.getHideOnClose = () => Boolean(config.launcher.hideOnClose);
exports.setHideOnClose = (value) => { config.launcher.hideOnClose = boolHandler(value, DEFAULT_CONFIG.launcher.hideOnClose); exports.save(); }
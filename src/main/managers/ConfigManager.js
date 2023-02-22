const fs = require('fs');
const path = require('path');
const { debounce } = require('../util/Shedulers');
const { shallowEqual } = require('../util/Iterates');

const logger = require('../util/loggerutil')('%c[ConfigManager]', 'color: #1052a5; font-weight: bold');

const rootPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME);
const launcherDir = path.normalize((process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")) + '/.tjmc') || require('electron').remote.app.getPath('userData');

const configName = 'launcher-config.json';
const configPath = path.join(launcherDir, configName);

logger.debug("Config Path:", configPath);

/**
 * Configuration
 * @type {DEFAULT_CONFIG}
 */
var config = undefined;

const DEFAULT_CONFIG = Object.seal({
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
});

const callbacks = [void 0];
let silentMode = false;

exports.addCallback = (cb = (config) => void 0) => {
    if (typeof cb === "function") {
        callbacks.push(cb);
    }
};
exports.removeCallback = (cb = (config) => void 0) => {
    const index = callbacks.indexOf(cb);
    if (index !== -1) {
        callbacks.splice(index, 1);
    }
};
const runCallbacks = () => {
    callbacks.forEach((cb) => typeof cb === "function" ? cb({ ...config }) : null);
};

function validateKeySet(srcObj, destObj) {
    if (srcObj == null) srcObj = {};
    const keys = Object.keys(srcObj);
    for (let i = 0; i < keys.length; i++) {
        if (typeof destObj[keys[i]] === 'undefined') {
            destObj[keys[i]] = srcObj[keys[i]];
        } else if (typeof srcObj[keys[i]] === 'object' && srcObj[keys[i]] != null && !(srcObj[keys[i]] instanceof Array)) {
            destObj[keys[i]] = validateKeySet(srcObj[keys[i]], destObj[keys[i]]);
        }
    }
    return destObj;
}

exports.isLoaded = () => config != undefined;

const readConfig = (configPath) => {
    let config, forceSave = false;
    if (!fs.existsSync(configPath)) {
        logger.debug('Generating a new configuration file...');
        config = DEFAULT_CONFIG;
        forceSave = true;
    }
    if (!this.isLoaded() || !forceSave) {
        try {
            config = fs.readFileSync(configPath, "utf-8");
            config = JSON.parse(config);
        } catch (err) {
            logger.warn('Configuration file contains malformed JSON or is corrupted!');
            config = DEFAULT_CONFIG;
            forceSave = true;
        }
    }
    const validatedConfig = validateKeySet(DEFAULT_CONFIG, config);
    if (!shallowEqual(config, validatedConfig) || forceSave) // prevent unnecessary writings
        exports.save(true, "read -> validate" + (forceSave && "\xa0-> force"));
    return validatedConfig;
}

exports.load = () => {
    config = readConfig(configPath);
    logger.debug("Load launcher config", "=>", (this.isLoaded() ? 'success' : 'failure'));
    if (this.isLoaded()) fs.watch(configPath, watchDebounce);
    return config;
}

const watchCallback = (event, filename) => {
    if (filename == configName) {
        logger.log("[W]", `${filename} file`, "->", event);
        config = readConfig(configPath);
        if (event == "change") {
            if (!silentMode) {
                runCallbacks();
            } else {
                logger.warn("> silent push");
            }
        }
    }
}
const watchDebounce = debounce(watchCallback, 100, true, false);

exports.save = (silent = false, reason = "") => {
    silentMode = silent;
    if (!fs.existsSync(configPath))
        fs.mkdirSync(path.join(configPath, '..'), { recursive: true });
    try {
        const content = JSON.stringify(config, null, 4);
        fs.writeFileSync(configPath, content, "utf-8");
    } catch (e) {
        logger.error('Config save error:', e)
    }
    logger.debug("Config saved!", "Silent:", silent, "Reason:", reason);
    silentMode = false;
}

exports.getAllOptionsSync = () => config;
exports.getAllOptions = async () => config;
exports.setOption = async (key, value) => {
    let valuePath = key.split('.');
    let last = valuePath.pop();
    valuePath.reduce((o, k) => o[k] = o[k] || {}, config)[last] = value;
    exports.save(false, "set option");
    return true;
}

exports.getLauncherDirectory = () => launcherDir;
exports.getDataDirectory = (def = false) => def ? DEFAULT_CONFIG.overrides.path.root : config.overrides.path.root;
exports.getVersionsDirectory = (def = false) => def ? DEFAULT_CONFIG.overrides.path.directory : config.overrides.path.directory;

exports.getLaunchFullscreen = () => Boolean(config.minecraft.launch.fullscreen);
exports.getCheckUpdates = () => Boolean(config.launcher.checkUpdates);
exports.getDisableHardwareAcceleration = () => Boolean(config.launcher.disableHardwareAcceleration);
exports.getHideOnClose = () => Boolean(config.launcher.hideOnClose);
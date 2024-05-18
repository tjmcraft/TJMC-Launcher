const { launcherDir } = require('../Paths');
const Config = require('@tjmc/config');
const path = require('path');
const loggerutil = require('../util/loggerutil');

/**
 * @type {import('../global').HostConfig}
 */
const DEFAULT_CONFIG = Object.seal({
    java: {
        path: '',
        memory: {
            max: 1024,
            min: 512
        },
        detached: true,
        cwd: '',
        args: '',
    },
    launcher: {
        checkUpdates: true,
        checkUpdatesInterval: 60 * 24, // every 24 hours
        disableHardwareAcceleration: false,
        hideOnClose: true,
        openDevTools: false,
    },
    overrides: {
        path: {
            minecraft: path.join(launcherDir, 'minecraft'),
            versions: path.join(launcherDir, 'minecraft', 'versions'),
            gameDirectory: path.join(launcherDir, 'minecraft')
        },
        checkHash: false,
        checkFiles: false,
    },
    minecraft: {
        launch: {
            fullscreen: false,
            width: 1280,
            height: 720
        },
        autoConnect: false,
        hideOnLaunch: true,
    },
});

const logger = loggerutil('%c[ConfigManager]', 'color: #1052a5; font-weight: bold');

const config = new Config({
    configName: 'launcher-config.json',
    configDir: launcherDir,
    defaultConfig: DEFAULT_CONFIG,
    logger: logger,
});

module.exports.load = () => config.load();
module.exports.getOption = config.getOption;
module.exports.addCallback = config.addCallback;
module.exports.removeCallback = config.removeCallback;
module.exports.watchOption = config.watchOption;

/**
 *
 * @returns {DEFAULT_CONFIG}
 */
exports.getAllOptionsSync = () => config.getOption();
exports.getAllOptions = async () => config.getOption();
exports.setOption = (key, value) => config.setOption(key, value);

exports.getMinecraftDirectory = (def = false) => config.getOption(config => config.overrides.path.minecraft, def);
exports.getVersionsDirectory = (def = false) => config.getOption(config => config.overrides.path.versions, def);
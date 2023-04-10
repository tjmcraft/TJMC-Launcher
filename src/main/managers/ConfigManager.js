const { launcherDir } = require('../Paths');
const Config = require('../libs/Config');
const path = require('path');

const DEFAULT_CONFIG = Object.seal({
    java: {
        javaPath: '',
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
        openDevTools: false,
    },
    overrides: {
        path: {
            minecraft: path.join(launcherDir, 'minecraft'),
            versions: path.join(launcherDir, 'minecraft', 'versions'),
            gameDirectory: path.join(launcherDir, 'minecraft')
        },
        checkHash: true,
        checkFiles: true,
    },
    minecraft: {
        launch: {
            fullscreen: false,
            width: 1280,
            height: 720
        }
    },
});

const config = new Config({
    prefix: "ConfigManager",
    color: "#1052a5",
    configName: 'launcher-config.json',
    configDir: launcherDir,
    defaultConfig: DEFAULT_CONFIG,
});

module.exports.load = () => config.load();
module.exports.getOption = config.getOption;
module.exports.addCallback = config.addCallback;
module.exports.removeCallback = config.removeCallback;
module.exports.watchOption = config.watchOption;

exports.getAllOptionsSync = () => config.getOption();
exports.getAllOptions = async () => config.getOption();
exports.setOption = (key, value) => config.setOption(key, value);

exports.getMinecraftDirectory = (def = false) => config.getOption(config => config.overrides.path.minecraft, def);
exports.getVersionsDirectory = (def = false) => config.getOption(config => config.overrides.path.versions, def);
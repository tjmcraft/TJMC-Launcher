const path = require('path');
const Config = require('../libs/Config');

const launcherDir = path.normalize(
    (
        process.env.APPDATA || (
            process.platform == 'darwin' ?
                process.env.HOME + '/Library/Preferences' :
                process.env.HOME + "/.local/share"
        )
    ) + '/.tjmc'
) || require('electron').remote.app.getPath('userData');


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

const config = new Config({
    prefix: "ConfigManager",
    color: "#1052a5",
    configName: 'launcher-config.json',
    configDir: launcherDir,
    defaultConfig: DEFAULT_CONFIG,
});

module.exports.load = () => config.load();
module.exports.addCallback = config.addCallback;
module.exports.removeCallback = config.removeCallback;

exports.getAllOptionsSync = () => config.getOption();
exports.getAllOptions = async () => config.getOption();
exports.setOption = (key, value) => config.setOption(key, value);

exports.getLauncherDirectory = () => launcherDir;
exports.getDataDirectory = (def = false) => config.getOption(config => config.overrides.path.root, def);
exports.getVersionsDirectory = (def = false) => config.getOption(config => config.overrides.path.directory, def);

exports.getCheckUpdates = () => Boolean(config.getOption(config => config.launcher.checkUpdates));
exports.getDisableHardwareAcceleration = () => Boolean(config.getOption(config => config.launcher.disableHardwareAcceleration));
exports.getHideOnClose = () => Boolean(config.getOption(config => config.launcher.hideOnClose));
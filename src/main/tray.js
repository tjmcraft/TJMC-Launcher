const { Tray, Menu, app } = require("electron");
const { openDir, platformIcon } = require("./helpers");

const ConfigManager = require('./managers/ConfigManager');
const InstallationsManager = require("./managers/InstallationsManager");
const Launcher = require('./Launcher');
const MainWindow = require("./MainWindow");

/**
 * @type {Tray} - Tray instance
 */
var tray = undefined;

exports.createTray = async () => {
    tray = new Tray(process.platform != "win32" ? platformIcon.resize({ width: 16, height: 16 }) : platformIcon);
    //tray.on('right-click', toggleWindow)
    //tray.on('double-click', toggleWindow)
    process.platform === "win32" && tray.on('click', function (event) {
        MainWindow.restore();
    })
    this.updateTray();
};
exports.destroyTray = () => tray != void 0 && tray.destroy();

/**
 *
 * @param {ReturnType<typeof InstallationsManager.getInstallations> | undefined} installations
 */
exports.updateTray = (installations = undefined) => {
    if (!installations) installations = InstallationsManager.getInstallations();
    installations = Object.fromEntries(Object.entries(installations).filter(([k, v]) => v.lastUsed).sort(([, a], [, b]) => {
        return new Date(a.lastUsed) - new Date(b.lastUsed);
    }).slice(1).slice(-5).reverse());
    const menu = Menu.buildFromTemplate([
        {
            label: 'TJMC-Launcher',
            icon: platformIcon.resize({ width: 16, height: 16 }),
            enabled: process.platform != "win32",
            click: () => process.platform != "win32" && MainWindow.restore(),
        },
        {
            type: 'separator'
        },
        ...(Object.entries(installations).map(([hash,e]) => ({
            label: e.name,
            click: () => Launcher.launchWithEmit(hash),
        }))),
        {
            type: 'separator'
        },
        {
            label: 'Settings',
            click: () => {
                MainWindow.restore();
                MainWindow.send('open-settings');
            }
        },
        {
            label: 'Open Folder',
            click: () => openDir(ConfigManager.getMinecraftDirectory())
        },
        {
            type: 'separator'
        },
        {
            label: 'Quit',
            click: () => app.quit()
        }
    ]);
    tray.setContextMenu(menu);
    tray.setToolTip("TJMC-Launcher");
}
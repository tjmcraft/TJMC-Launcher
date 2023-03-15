const { Tray, Menu, app } = require("electron");
const { openDir, platformIcon } = require("./helpers");

const ConfigManager = require('./managers/ConfigManager');
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
        {
            label: 'Settings',
            click: () => {
                MainWindow.restore();
                MainWindow.send('open-settings');
            }
        },
        {
            label: 'Open Folder',
            click: () => openDir(ConfigManager.getDataDirectory())
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
};
exports.destroyTray = () => tray != void 0 && tray.destroy();
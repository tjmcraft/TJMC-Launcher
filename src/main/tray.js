const { Tray, Menu, app } = require("electron");
const { restoreWindow, openDir, platformIcon, windowSend } = require("./helpers");

const ConfigManager = require('./managers/ConfigManager');

/**
 * @type {Tray} - Tray instance
 */
var tray = undefined;

const createTray = async () => {
  tray = new Tray(process.platform != "win32" ? platformIcon.resize({ width: 16, height: 16 }) : platformIcon);
  //tray.on('right-click', toggleWindow)
  //tray.on('double-click', toggleWindow)
  process.platform === "win32" && tray.on('click', function (event) {
      restoreWindow();
  })
  const menu = Menu.buildFromTemplate([
      {
          label: 'TJMC-Launcher',
          icon: platformIcon.resize({ width: 16, height: 16 }),
          enabled: process.platform != "win32",
          click: () => process.platform != "win32" && restoreWindow()
      },
      {
          type: 'separator'
      },
      {
          label: 'Settings',
          click: () => {
              restoreWindow();
              windowSend('open-settings');
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
}

const destroyTray = () => {
  return tray && tray.destroy();
};

exports.createTray = createTray;
exports.destroyTray = destroyTray;
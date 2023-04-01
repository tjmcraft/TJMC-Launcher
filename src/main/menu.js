const { Menu, app } = require("electron");
const { openDir } = require("./helpers");
const MainWindow = require("./MainWindow");

const ConfigManager = require('./managers/ConfigManager');

const createMenu = async () => {
  const isMac = (process.platform === 'darwin');
  const template = [
      ...(isMac ? [{
          label: 'Application',
          submenu: [
              {
                  label: 'About Application',
                  selector: 'orderFrontStandardAboutPanel:'
              },
              {
                  type: 'separator'
              },
              {
                  label: 'Quit',
                  accelerator: 'Command+Q',
                  click: () => {
                      app.quit()
                  }
              }
          ]
      }] : []),
      {
          label: 'Minecraft',
          submenu: [{
                  label: 'Root Directory',
                  accelerator: 'Ctrl+Shift+D',
                  click: () => openDir(ConfigManager.getMinecraftDirectory())
              },
              {
                  label: 'Options',
                  accelerator: 'Ctrl+Shift+I',
                  click: () => {
                      MainWindow.restore();
                      MainWindow.send('open-settings');
                  }
              }
          ]
      },
      // { role: 'editMenu' }
      {
          label: 'Edit',
          submenu: [{
                  role: 'undo'
              },
              {
                  role: 'redo'
              },
              {
                  type: 'separator'
              },
              {
                  role: 'cut'
              },
              {
                  role: 'copy'
              },
              {
                  role: 'paste'
              },
              ...(isMac ? [{
                      role: 'pasteAndMatchStyle'
                  },
                  {
                      role: 'delete'
                  },
                  {
                      role: 'selectAll'
                  },
                  {
                      type: 'separator'
                  },
                  {
                      label: 'Speech',
                      submenu: [{
                              role: 'startSpeaking'
                          },
                          {
                              role: 'stopSpeaking'
                          }
                      ]
                  }
              ] : [{
                      role: 'delete'
                  },
                  {
                      type: 'separator'
                  },
                  {
                      role: 'selectAll'
                  }
              ])
          ]
      },
      // { role: 'viewMenu' }
      {
          label: 'View',
          submenu: [{
                  role: 'reload'
              },
              {
                  role: 'forceReload'
              },
              {
                  role: 'toggleDevTools',
                  accelerator: 'F12'
              },
              {
                  type: 'separator'
              },
              {
                  role: 'resetZoom'
              },
              {
                  role: 'zoomIn',
                  accelerator: isMac ? 'Cmd+=' : 'Ctrl+='
              },
              {
                  role: 'zoomOut',
                  accelerator: isMac ? 'Cmd+-' : 'Ctrl+-'
              },
              {
                  type: 'separator'
              },
              {
                  role: 'togglefullscreen',
                  accelerator: isMac ? 'Ctrl+Cmd+F' : 'F11'
              }
          ]
      },
      // { role: 'windowMenu' }
      {
          label: 'Window',
          submenu: [{
                  role: 'minimize'
              },
              {
                  role: 'zoom'
              },
              ...(isMac ? [{
                      type: 'separator'
                  },
                  {
                      role: 'front'
                  },
                  {
                      type: 'separator'
                  },
                  {
                      role: 'window'
                  }
              ] : [{
                  role: 'close'
              }])
          ]
      }
  ];
  const menuObject = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menuObject);

}

exports.createMenu = createMenu;
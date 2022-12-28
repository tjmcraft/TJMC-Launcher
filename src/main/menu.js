const { Menu, app } = require("electron");
const { windowSend, restoreWindow, openDir } = require("./helpers");

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
                  accelerator: isMac ? 'Cmd+Alt+D' : 'Ctrl+Shift+D',
                  click: () => openDir(ConfigManager.getDataDirectory())
              },
              {
                  label: 'Options',
                  accelerator: isMac ? 'Cmd+Alt+I' : 'Ctrl+Shift+I',
                  click: () => {
                      restoreWindow();
                      windowSend('open-settings');
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
                  accelerator: 'Ctrl+='
              },
              {
                  role: 'zoomOut',
                  accelerator: 'Ctrl+-'
              },
              {
                  type: 'separator'
              },
              {
                  role: 'togglefullscreen',
                  accelerator: 'F11'
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
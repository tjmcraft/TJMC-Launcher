const { Menu, app } = require("electron");
const { openDir } = require("./helpers");
const MainWindow = require("./MainWindow");

const ConfigManager = require('./managers/ConfigManager');
const { checkForUpdates } = require("./Updater");

const createMenu = async () => {
    const isMac = (process.platform === 'darwin');
    const template = [
        {
            label: 'Application',
            submenu: [
                ...(isMac ? [{
                    label: 'About TJMC-Launcher',
                    selector: 'orderFrontStandardAboutPanel:'
                }] : []),
                {
                    label: 'Check for updates',
                    accelerator: 'Ctrl+Shift+U',
                    click: () => checkForUpdates()
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Settings',
                    accelerator: 'Ctrl+Shift+I',
                    click: () => {
                        MainWindow.restore();
                        MainWindow.send('open-settings');
                    }
                },
                {
                    label: 'Root Directory',
                    accelerator: 'Ctrl+Shift+D',
                    click: () => openDir(ConfigManager.getMinecraftDirectory())
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    accelerator: isMac ? 'Command+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit()
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
            label: 'Installation',
            submenu: [
                {
                    label: 'Run current',
                    accelerator: 'F5',
                    click: () => {
                        MainWindow.restore();
                        MainWindow.send('installation.run.current');
                    }
                },
                {
                    label: 'Run with force',
                    accelerator: 'Shift+F5',
                    click: () => {
                        MainWindow.restore();
                        MainWindow.send('installation.run.force');
                    }
                },
                {
                    label: 'Edit current',
                    accelerator: 'F4',
                    click: () => {
                        MainWindow.restore();
                        MainWindow.send('installation.edit.current');
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Create new',
                    accelerator: 'F3',
                    click: () => {
                        MainWindow.restore();
                        MainWindow.send('installation.create.new');
                    }
                },
            ]
        },
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
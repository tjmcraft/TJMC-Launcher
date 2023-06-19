const { Menu, app, shell } = require("electron");
const { openDir } = require("./helpers");
const MainWindow = require("./MainWindow");

const ConfigManager = require('./managers/ConfigManager');
const { checkForUpdates } = require("./Updater");

const isMac = (process.platform === 'darwin');

const runActionInRenderer = (type, data = undefined) => {
    MainWindow.restore();
    MainWindow.send('tjmc:runAction', { type: type, data: data });
};

/**
 * Resolve platform hotkey
 * @param {string} hotkey
 */
const resolveHotKey = (hotkey) => {
    const keys = hotkey.split('+');
    return keys.map(e => e.toLowerCase() == 'mod' ? (isMac ? 'Cmd' : 'Ctrl') : e).join('+');
};

const createMenu = async () => {
    const template = [
        {
            label: 'Application',
            submenu: [
                ...(isMac ? [
                    {
                        label: 'About TJMC-Launcher',
                        selector: 'orderFrontStandardAboutPanel:'
                    }
                ] : []),
                {
                    label: 'Check for updates',
                    accelerator: resolveHotKey('Mod+Shift+U'),
                    click: () => checkForUpdates()
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Settings',
                    accelerator: resolveHotKey('Mod+Shift+I'),
                    click: () => runActionInRenderer('openSettings')
                },
                {
                    label: 'Map',
                    accelerator: resolveHotKey('Mod+Shift+M'),
                    click: () => runActionInRenderer('openMap')
                },
                {
                    label: 'Root Directory',
                    accelerator: resolveHotKey('Mod+Shift+D'),
                    click: () => openDir(ConfigManager.getMinecraftDirectory())
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    accelerator: resolveHotKey('Mod+Q'),
                    click: () => app.quit()
                }
            ]
        },
        { role: 'editMenu' },
        {
            label: 'View',
            submenu: [
                {
                    role: 'reload'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'resetZoom'
                },
                {
                    role: 'zoomIn',
                    accelerator: resolveHotKey('Mod+=')
                },
                {
                    role: 'zoomOut',
                    accelerator: resolveHotKey('Mod+-')
                },
                {
                    type: 'separator'
                },
                {
                    role: 'togglefullscreen',
                    accelerator: resolveHotKey(isMac ? 'Ctrl+Cmd+F' : 'F11')
                }
            ]
        },
        {
            label: 'Installation',
            submenu: [
                {
                    label: 'Start Launching',
                    accelerator: resolveHotKey('F5'),
                    click: () => runActionInRenderer('runCurrentInstallation')
                },
                {
                    label: 'Start With Force',
                    accelerator: resolveHotKey('Ctrl+F5'),
                    click: () => runActionInRenderer('runInstallationForce')
                },
                {
                    label: 'Stop Launching',
                    accelerator: resolveHotKey('Shift+F5'),
                    click: () => runActionInRenderer('stopCurrentInstallation')
                },
                {
                    label: 'Edit Current',
                    accelerator: resolveHotKey('F4'),
                    click: () => runActionInRenderer('editInstallation')
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Create new',
                    accelerator: resolveHotKey('F3'),
                    click: () => runActionInRenderer('createInstallation')
                },
            ]
        },
        { role: 'windowMenu' },
        {
            label: 'Help',
            role: 'help',
            submenu: [
                {
                    label: 'Help and support',
                    accelerator: resolveHotKey('F1'),
                    click: () => shell.openExternal('https://launcher.tjmc.ru/')
                },
                {
                    label: 'Keyboard shortcuts',
                    accelerator: resolveHotKey('Mod+/'),
                    click: () => runActionInRenderer('openShortcuts')
                },
                {
                    type: 'separator'
                },
                {
                    role: 'toggleDevTools',
                    accelerator: resolveHotKey('F12')
                },
            ]
        }
    ];
    const menuObject = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menuObject);

}

exports.createMenu = createMenu;
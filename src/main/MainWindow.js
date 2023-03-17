const { app, BrowserWindow, shell } = require('electron');

/**
 * @type {BrowserWindow} - The main window
 */
var win = undefined;
exports.window = win;

exports.create = () => new Promise((resolve, reject) => {

	const path = require('path');
	const ConfigManager = require('./managers/ConfigManager');
	const Updater = require('./Updater');

	require('./menu').createMenu();

	let windowState = require('./libs/WindowState')({
		width: 1280,
		height: 720
	});

	win = new BrowserWindow({
		x: windowState.x,
		y: windowState.y,
		width: windowState.width,
		height: windowState.height,
		minWidth: 720,
		minHeight: 480,
		show: false,
		resizable: true,
		frame: process.platform === 'darwin',
		webPreferences: {
			preload: path.join(__dirname, 'preloader.js'),
			// nodeIntegration: true,
			// sandbox: false,
			contextIsolation: true,
			worldSafeExecuteJavaScript: true,
			spellcheck: true,
		},
		titleBarStyle: 'default',
		roundedCorners: true,
		backgroundColor: '#171614'
	});

	windowState.manage(win);

	win.loadFile(path.resolve(__dirname, '../render/dist/index.html'));

	// win.once('show', () => resolve(win));
	win.once('ready-to-show', () => resolve(win));
	win.on('enter-full-screen', () => win.webContents.send('enter-full-screen'));
	win.on('leave-full-screen', () => win.webContents.send('leave-full-screen'));
	win.on('blur', () => win.webContents.send('blur'));
	win.on('focus', () => win.webContents.send('focus'));
	win.on('closed', () => (win = null, app.quit()));
	win.on('close', (event) => {
		if (ConfigManager.getOption("launcher.hideOnClose")) {
			event.preventDefault();
			win.hide();
		};
	});

	win.webContents.on("did-finish-load", () => {
		console.debug("> finish load");
		if (ConfigManager.getOption("launcher.checkUpdates")) {
			Updater.checkForUpdates();
		}
	});

	// handler for blank target
	win.webContents.setWindowOpenHandler(({ url }) =>
		url.startsWith("file://") ? { action: 'allow' } :
			(shell.openExternal(url), { action: 'deny' })
	);

	// handler for self target
	win.webContents.on('will-navigate', (e, url) =>
		url != win.webContents.getURL() &&
		(e.preventDefault(), shell.openExternal(url))
	);

	ConfigManager.watchOption("launcher.openDevTools")(state =>
		state ? win.webContents.openDevTools() : win.webContents.closeDevTools()
	)

});

exports.restore = () => {
	if (win == void 0) {
		exports.create();
	} else {
    if (!win.isVisible()) win.show();
    if (win.isMinimized()) win.restore();
    win.focus();
	}
};
exports.show = () => win != void 0 && win.show();
exports.destroy = () => win != void 0 && win.destroy();
exports.setProgressBar = (progress) => win != void 0 && win.setProgressBar(progress);
exports.send = (channel, ...args) => win != void 0 && win.webContents.send(channel, ...args);
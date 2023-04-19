const { app, BrowserWindow, shell, ipcMain } = require('electron');

/**
 * Callback for adding two numbers.
 *
 * @callback windowEventCallback
 * @param {BrowserWindow} win - The window instance
 * @param {any} args - Arguments
 */

/**
 * Connect window to event
 * @param {windowEventCallback} callback
 * @returns
 */
const withWindow = (callback = (win, ...args) => void 0) => {
	return (event, ...args) => {
		const webContents = event.sender
		const win = BrowserWindow.fromWebContents(webContents);
		if (typeof callback == 'function') callback(win, ...args);
	};
}

/**
 * @type {BrowserWindow} - The main window
 */
exports.window = undefined;

exports.create = () => new Promise((resolve, reject) => {

	const path = require('path');
	const ConfigManager = require('./managers/ConfigManager');
	const Updater = require('./Updater');

	require('./menu').createMenu();

	let windowState = require('./libs/WindowState')({
		width: 1280,
		height: 720
	});

	this.window = new BrowserWindow({
		x: windowState.x,
		y: windowState.y,
		width: windowState.width,
		height: windowState.height,
		minWidth: 880,
		minHeight: 520,
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

	windowState.manage(this.window);

	this.window.once('ready-to-show', () => resolve(this.window));
	this.window.on('enter-full-screen', () => this.window.webContents.send('enter-full-screen'));
	this.window.on('leave-full-screen', () => this.window.webContents.send('leave-full-screen'));
	this.window.on('blur', () => this.window.webContents.send('blur'));
	this.window.on('focus', () => this.window.webContents.send('focus'));
	this.window.on('closed', () => (this.window = null, app.quit()));
	this.window.on('close', (event) => {
		if (ConfigManager.getOption("launcher.hideOnClose")) {
			event.preventDefault();
			this.window.hide();
		};
	});

	ipcMain.on("window:action.close", withWindow((window) => window.close()));
	ipcMain.on("window:action.maximize", withWindow((window) =>
		window.isMaximized() ? window.unmaximize() : window.maximize()
	));
	ipcMain.on("window:action.minimize", withWindow((window) => window.minimize()));
	ipcMain.on("window:action.fullscreen", withWindow((window) => window.fullScreen()));
	ipcMain.handle('window:isFullScreen', async () => this.window.isFullScreen());

	this.window.webContents.on("did-finish-load", () => {
		console.debug("> finish load");
		if (ConfigManager.getOption("launcher.checkUpdates")) {
			Updater.checkForUpdates();
		}
		this.window.setProgressBar(-1);
	});

	// handler for blank target
	this.window.webContents.setWindowOpenHandler(({ url }) =>
		url.startsWith("file://") ? { action: 'allow' } :
			(shell.openExternal(url), { action: 'deny' })
	);

	// handler for self target
	this.window.webContents.on('will-navigate', (e, url) =>
		url != this.window.webContents.getURL() &&
		(e.preventDefault(), shell.openExternal(url))
	);

	ConfigManager.watchOption("launcher.openDevTools")(state =>
		state ? this.window.webContents.openDevTools() : this.window.webContents.closeDevTools()
	)

	this.window.loadFile(path.resolve(__dirname, '../render/dist/index.html'));

});

exports.restore = () => {
	if (this.window == void 0) {
		this.create();
	} else {
    if (!this.window.isVisible()) this.window.show();
    if (this.window.isMinimized()) this.window.restore();
    this.window.focus();
	}
};
exports.focus = () => this.window != void 0 && this.window.focus();
exports.show = () => this.window != void 0 && this.window.show();
exports.destroy = () => this.window != void 0 && this.window.destroy();
exports.setProgressBar = (progress) => this.window != void 0 && this.window.setProgressBar(progress);
exports.send = (channel, ...args) => this.window != void 0 && this.window.webContents.send(channel, ...args);
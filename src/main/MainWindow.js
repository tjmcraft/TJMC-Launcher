'use strict';
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');

const path = require('path');
const os = require('os');

const ConfigManager = require('./managers/ConfigManager');
const { restoreWindow } = require('./helpers');

/**
 * @type {BrowserWindow} - The main window
 */
var win = undefined;

exports.MainWindow = win;

const createMainWindow = () => new Promise((resolve, reject) => {

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
					nodeIntegration: false,
					contextIsolation: true,
					worldSafeExecuteJavaScript: true,
					spellcheck: true,
					enableRemoteModule: true,
			},
			titleBarStyle: 'default',
			roundedCorners: true,
			backgroundColor: '#171614'
	});

	require('@electron/remote/main').enable(win.webContents);

	windowState.manage(win);

	win.loadFile(path.resolve(__dirname, '../render/dist/index.html'));

	win.once('show', () => resolve(win));
	win.once('ready-to-show', () => win.show());
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
					// checkForUpdates();
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

exports.createMainWindow = createMainWindow;

const restoreMainWindow = () => {
	if (win == void 0) createMainWindow();
	else restoreWindow();
};

exports.restoreMainWindow = restoreMainWindow;
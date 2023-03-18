console.debug(">>", "process type", process.type);
const { ipcRenderer, contextBridge } = require('electron');
const logger = console;

logger.debug("Application loading...");

/**
 * Function resolves current platform
 * @returns os
 */
const getOS = () =>
  Object.seal({
    aix: "linux",
    darwin: "osx",
    freebsd: "linux",
    linux: "linux",
    openbsd: "linux",
    sunos: "linux",
		win32: "windows",
	})[process.platform] || "web";


//Set Current Window as win
const win = {};

const windowActions = {
  close: () => win.close(),
  maximize: () => win.isMaximized() ? win.unmaximize() : win.maximize(),
  minimize: () => win.minimize(),
  restore: () => win.restore(),
  blur: () => win.blur(),
  focus: () => win.focus(),
  fullscreen: () => win.fullscreen(),
  setProgressBar: (e) => win.setProgressBar(e),
  setZoomFactor: (e) => win.webContents.setZoomFactor(e),
};

document.addEventListener('readystatechange', function () {
  if (document.readyState === 'interactive') {
    logger.debug("Initializing...");
    if (win.isFullScreen()) enterFullScreen();
  } else if (document.readyState === 'complete') {
    logger.debug("Init complete!");
  }
  win.setProgressBar(-1);
});

function enterFullScreen () {
  document.documentElement.classList.add('fullscreen');
}
function leaveFullScreen () {
  document.documentElement.classList.remove('fullscreen');
}
function windowBlur () {
  document.documentElement.classList.add('blur');
}
function windowFocus () {
  document.documentElement.classList.remove('blur');
}

contextBridge.exposeInMainWorld('__STANDALONE__', true);
contextBridge.exposeInMainWorld('system', { os: getOS() });

process.once('loaded', () => {
  contextBridge.exposeInMainWorld('electron', {
    on: (eventName, callback) => ipcRenderer.on(eventName, callback),
    invoke: (eventName, ...params) => ipcRenderer.invoke(eventName, ...params),
  });
  contextBridge.exposeInMainWorld('tjmcNative', {
    window: {
      close: windowActions.close,
      maximize: windowActions.maximize,
      minimize: windowActions.minimize,
      restore: windowActions.restore,
      blur: windowActions.blur,
      focus: windowActions.focus,
      fullscreen: windowActions.fullscreen,
      setProgressBar: windowActions.setProgressBar,
      setZoomFactor: windowActions.setZoomFactor,
    },
    ipc: {
      send: ipcRenderer.send,
      on: ipcRenderer.on,
      invoke: ipcRenderer.invoke,
    }
  });
});

// Init global instances
process.once('loaded', () => {
  ipcRenderer.on('enter-full-screen', enterFullScreen);
  ipcRenderer.on('leave-full-screen', leaveFullScreen);
  ipcRenderer.on('blur', windowBlur);
  ipcRenderer.on('focus', windowFocus);
});
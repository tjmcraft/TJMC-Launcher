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
  close: () => ipcRenderer.send("window:action.close"),
  maximize: () => ipcRenderer.send("window:action.maximize"),
  minimize: () => ipcRenderer.send("window:action.minimize"),
  fullscreen: () => ipcRenderer.send("window:action.fullscreen"),
};

document.addEventListener('readystatechange', function () {
  if (document.readyState === 'interactive') {
    logger.debug("Initializing...");
  } else if (document.readyState === 'complete') {
    logger.debug("Init complete!");
  }
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
    on: (channel, listener) => ipcRenderer.on(channel, listener),
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  });
  contextBridge.exposeInMainWorld('tjmcNative', {
    window: {
      close: windowActions.close,
      maximize: windowActions.maximize,
      minimize: windowActions.minimize,
      fullscreen: windowActions.fullscreen,
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
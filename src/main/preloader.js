console.debug(">>", "process type", process.type);
const { ipcRenderer, contextBridge } = require('electron');
const logger = console;

logger.debug("Application loading...");

/**
 * Function returns current platform
 * @returns os
 */
function getOS() {
  switch (process.platform) {
    case 'win32': return 'windows';
    case 'darwin': return 'osx';
    case 'linux': return 'linux';
    default: return 'web';
  }
}

console.debug(">", "con", contextBridge);

//Set Current Window as win
const win = {};

const windowEvents = {
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

process.once('loaded', () => {
  contextBridge.exposeInMainWorld('electron', {
    on(eventName, callback) {
      ipcRenderer.on(eventName, callback)
    },
    async invoke(eventName, ...params) {
      return await ipcRenderer.invoke(eventName, ...params)
    },
  });
});

contextBridge.exposeInMainWorld('__STANDALONE__', true);
contextBridge.exposeInMainWorld('system', {
  os: getOS()
});
contextBridge.exposeInMainWorld('tjmcNative', {
  window: {
    close: windowEvents.close,
    maximize: windowEvents.maximize,
    minimize: windowEvents.minimize,
    restore: windowEvents.restore,
    blur: windowEvents.blur,
    focus: windowEvents.focus,
    fullscreen: windowEvents.fullscreen,
    setProgressBar: windowEvents.setProgressBar,
    setZoomFactor: windowEvents.setZoomFactor,
  },
  app: {
    getVersion: app.getVersion,
    relaunch: app.relaunch,
    version: process.versions,
  },
  process: {
    platform: process.platform,
    arch: process.arch,
    env: process.env,
  },
  ipc: {
    send: ipcRenderer.send,
    on: ipcRenderer.on,
    invoke: ipcRenderer.invoke,
  }
});

// Init global instances
process.once('loaded', () => {
  ipcRenderer.on('enter-full-screen', enterFullScreen);
  ipcRenderer.on('leave-full-screen', leaveFullScreen);
  ipcRenderer.on('blur', windowBlur);
  ipcRenderer.on('focus', windowFocus);
});
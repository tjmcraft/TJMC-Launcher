const { ipcRenderer, contextBridge } = require('electron');

const currentOS =
  Object.seal({
    aix: "linux",
    darwin: "osx",
    freebsd: "linux",
    linux: "linux",
    openbsd: "linux",
    sunos: "linux",
		win32: "windows",
  })[process.platform] || "web";

const windowActions = {
  close: () => ipcRenderer.send("window:action.close"),
  maximize: () => ipcRenderer.send("window:action.maximize"),
  minimize: () => ipcRenderer.send("window:action.minimize"),
  fullscreen: () => ipcRenderer.send("window:action.fullscreen"),
};

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
contextBridge.exposeInMainWorld('system', { os: currentOS });

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
    versions: process.versions,
  });
  ipcRenderer.on('enter-full-screen', enterFullScreen);
  ipcRenderer.on('leave-full-screen', leaveFullScreen);
  ipcRenderer.on('blur', windowBlur);
  ipcRenderer.on('focus', windowFocus);
});
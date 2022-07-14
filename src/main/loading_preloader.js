const { contextBridge, ipcRenderer, shell } = require("electron");
const logger = require('./util/loggerutil')('%c[LoadingPreloader]', 'color: #a02d2a; font-weight: bold');

logger.debug('Application is preloading...');

process.once('loaded', () => {
  contextBridge.exposeInMainWorld('electron', {
    on(eventName, callback) {
      ipcRenderer.on(eventName, callback)
    },
    async invoke(eventName, ...params) {
      return await ipcRenderer.invoke(eventName, ...params)
    },
    async shellOpenExternal(url) {
      await shell.openExternal(url)
    },
    async shellOpenPath(file) {
      await shell.openPath(file)
    },
    async shellTrashItem(file) {
      await shell.trashItem(file)
    }
  })
});
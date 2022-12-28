const { shell, BrowserWindow, nativeImage } = require("electron");
const path = require('path');

exports.windowSend = function(cmd) {
  const windows = BrowserWindow.getAllWindows();
  if (windows[0]) {
    console.log(`Sending "${cmd}"`);
    windows[0].webContents.send(cmd);
  } else {
    console.log(`Tried to send "${cmd}", but could not find window`);
  }
}

exports.restoreWindow = function() {
  const windows = BrowserWindow.getAllWindows();

  if (windows[0]) {
    const win = windows[0];
    if (!win) return;
    if (!win.isVisible()) win.show();
    if (win.isMinimized()) win.restore();
    win.focus();
  } else {
    console.log(`Tried to restore window, but could not find window`);
  }
}

exports.openDir = function(path) {
  // logger.debug("[Main]", "{OpenMineDir}", "Path:", path);
  shell.openPath(path);
}

exports.platformIcon = ((platform) => {
  let ext, filename;
  switch (platform) {
      case "win32":
          ext = "ico";
          filename = "icon";
          break;
      default:
          ext = "png";
          filename = "icon";
  }
  const iconPath = path.join(__dirname, '../..', 'app', 'assets', 'images', `${filename}.${ext}`);
  const image = nativeImage.createFromPath(iconPath);
  image.setTemplateImage(true);
  return image;
})(process.platform);
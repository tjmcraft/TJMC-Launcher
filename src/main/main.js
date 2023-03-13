'use strict';
const { app } = require('electron');

console.time("> require");

const logger = require('./util/loggerutil')('%c[Main-Core]', 'color: #ff2119; font-weight: bold;');

const ConfigManager = require('./managers/ConfigManager');
const VersionManager = require('./managers/VersionManager');
const InstallationsManager = require('./managers/InstallationsManager');

const { handleArgsLink, protoHandler, setInstanceProtocolHandler } = require('./ProtoHandler');
const { destroyTray, createTray } = require('./tray');
const MainWindow = require('./MainWindow');
const Host = require('./Host');

console.timeEnd("> require");

const gotTheLock = app.requestSingleInstanceLock();

if (gotTheLock) {

    console.time("> init lock");

    logger.debug("Process args:", process.argv);

    app.on('second-instance', (event, commandLine, workingDirectory) => {
        console.debug("Second instance call", commandLine);
        if (!handleArgsLink(commandLine)) {
            MainWindow.restore();
        }
    });

    app.on('open-url', (event, data) => {
        event.preventDefault();
        console.debug("Open url call", data);
        if (!protoHandler(data)) {
            MainWindow.restore();
        }
    });

    ConfigManager.load(); // Load config

    // Hardware acceleration.
    if (ConfigManager.getOption("launcher.disableHardwareAcceleration")) {
        app.disableHardwareAcceleration();
    }

    app.once('ready', async () => {

        // Entry point -->
        console.time("> init managers");
        setInstanceProtocolHandler();
        try {
            VersionManager.load(ConfigManager.getVersionsDirectory()); // set versions dir
            VersionManager.updateGlobalVersionsConfig(); // update global versions manifest
            InstallationsManager.load(ConfigManager.getLauncherDirectory()); // set installations config dir
            Host.start(); // start socket and ipc servers
        } catch (e) {
            logger.error("[Startup]", "Error:", e);
            app.quit();
        }
        console.timeEnd("> init managers");

        console.time("> init ready");
        createTray().catch(void 0);
        require('@electron/remote/main').initialize();

        if (!handleArgsLink(process.argv)) {
            MainWindow.create().catch((e) => {
                logger.error("[MainWindow]", "Error:", e);
                app.quit();
            });
        }

        console.timeEnd("> init ready");
    });

    app.on("window-all-closed", () => { });

    app.on('activate', () => {
        MainWindow.restore();
    });

    app.on('before-quit', () => {
        MainWindow.destroy();
        destroyTray();
    });

    console.timeEnd("> init lock");
} else {
    app.quit();
}
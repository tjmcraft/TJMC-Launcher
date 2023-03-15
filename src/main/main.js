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
            console.time("> init vm");
            VersionManager.load(ConfigManager.getVersionsDirectory()); // set versions dir
            console.timeEnd("> init vm");
            console.time("> init im");
            InstallationsManager.load(ConfigManager.getLauncherDirectory()); // set installations config dir
            console.timeEnd("> init im");
            console.time("> init hm");
            Host.start(); // start socket and ipc servers
            console.timeEnd("> init hm");
        } catch (e) {
            logger.error("[Startup]", "Error:", e);
            app.quit();
        }
        console.timeEnd("> init managers");

        console.time("> init ready");
        createTray().catch(void 0);
        require('@electron/remote/main').initialize();

        if (handleArgsLink(process.argv)) {
            MainWindow.create();
        } else {
            MainWindow.create().then(() => MainWindow.show());
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
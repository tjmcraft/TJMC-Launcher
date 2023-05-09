
const startTime = performance.now();
const { app } = require('electron');

console.time("> require");

const logger = require('./util/loggerutil')('%c[Main-Core]', 'color: #ff2119; font-weight: bold;');

const AuthManager = require('./managers/AuthManager');
const ConfigManager = require('./managers/ConfigManager');
const VersionManager = require('./managers/VersionManager');
const InstallationsManager = require('./managers/InstallationsManager');

const { handleArgsLink, protoHandler, setInstanceProtocolHandler } = require('./ProtoHandler');
const { destroyTray, createTray } = require('./tray');
const MainWindow = require('./MainWindow');

console.timeEnd("> require");

const gotTheLock = app.requestSingleInstanceLock();

if (gotTheLock) {

    console.debug(__dirname);

    (() => {

        console.time("> init lock");

        logger.debug("Process args:", process.argv);

        app.on('second-instance', (event, commandLine, workingDirectory) => {
            // console.debug("Second instance call", commandLine);
            if (!handleArgsLink(commandLine)) {
                MainWindow.restore();
            }
        });

        app.on('open-url', (event, data) => {
            event.preventDefault();
            // console.debug("Open url call", data);
            if (!protoHandler(data)) {
                MainWindow.restore();
            }
        });

        console.time("> init proto");
        setInstanceProtocolHandler();
        console.timeEnd("> init proto");

        ConfigManager.load(); // Load config

        // Hardware acceleration.
        if (ConfigManager.getOption("launcher.disableHardwareAcceleration")) {
            app.disableHardwareAcceleration();
        }

        app.once('ready', async () => {

            // Entry point -->
            console.time("> init managers");
            try {
                {
                    console.time("> init AuthManager");
                    await AuthManager.load();
                    console.timeEnd("> init AuthManager");
                }
                {
                    console.time("> init VersionManager");
                    VersionManager.load(ConfigManager.getVersionsDirectory()); // set versions dir
                    console.timeEnd("> init VersionManager");
                }
                {
                    console.time("> init InstallationsManager");
                    InstallationsManager.load(); // load installations
                    console.timeEnd("> init InstallationsManager");
                }
                {
                    console.time("> init HostBridge");
                    const Host = require('./Host');
                    await Host.start(); // start socket and ipc servers
                    console.timeEnd("> init HostBridge");
                }
            } catch (e) {
                logger.error("[Startup]", "Error:", e);
                app.quit();
            }
            console.timeEnd("> init managers");

            console.time("> init ready");
            createTray().catch(void 0);

            if (handleArgsLink(process.argv)) {
                MainWindow.create();
            } else {
                MainWindow.create().then(() => MainWindow.show());
            }

            console.timeEnd("> init ready");
            logger.debug("Total startup time:", performance.now() - startTime, "ms");
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
    })();
} else {
    app.quit();
}
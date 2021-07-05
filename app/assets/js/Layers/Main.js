// Imports
import { Layer } from "../Layer/Layer.js";
import { switchView, VIEWS } from "../Layer/LayerSwitcher.js";
import { modal } from "../Libs/AlertEx.js";
import { getCurrentVersionHash } from "../scripts/Installations.js";
import { isWeb, setProgressBar, startMinecraft, updatePlatform, updateTheme } from "../scripts/Tools.js";
import { Settings } from "../settings.js";
import { MainContainer } from "../ui/sidebar-main.js";

export function Main(props) {
    //Define main variables
    const mainContainer = new MainContainer(); // Main container of app
    const progressBars = mainContainer.sideBar.progressBars(); // Progress bar s in sidebar (installations)
    const processDots = mainContainer.sideBar.processDots(); // Process dots in sidebar (installations)
    const playButton = mainContainer.topContainer.toolbar.playButton; // Play button in the top toolbar (main content)
    const layer = new Layer({ label: '' }, mainContainer.content); // Create new layer
    layer.join(); // Join new layer

    VIEWS.main = layer.content; // Add main content to layer switcher

    playButton.addEventListener("click", async (event) => { //Register new eventListener for play button click event
        const versionHash = await getCurrentVersionHash(); // Get current version hash
        processDots[versionHash].show(); // Show process dots for current version
        startMinecraft(versionHash); // Start minecraft with given version hash
    });

    window.addEventListener("load", async (event) => { // Register new eventListener for window load event
        setProgressBar(-1); // Resete window progress bar
        updatePlatform(window.system?.os); // Update platform
        const registerEvents = await (!isWeb ? registerElectronEvents() : registerWebEvents()); // Register events handling
        if (registerEvents) { // If register success
            if (!isWeb) {
                updateTheme();
            }
            setTimeout(() => switchView(VIEWS.main, 100, 100), 1000); // Switch view to main
        }
    }, { once: true }); // Call it once and then destroy

    document.addEventListener("versions.refresh", async (event) => {
        mainContainer.refreshVersions();
    });

    // Define main events
    const Events = {
        openSettings: (data) => new Settings(), // Open settings
        startupSuccess: (data) => { // On success startup
            setProgressBar(-1);
            progressBars[data.version_hash].hide();
            setTimeout(() => processDots[data.version_hash].hide(), 1000);
        },
        startupError: (data) => { // On unsuccess startup
            console.warn(data.error);
            setProgressBar(-1);
            processDots[data.version_hash].hide();
            modal.alert("Что-то пошло не так...", data.error, 'error', { logType: true });
        },
        error: (data) => { // Programm error
            console.error(data.error);
            setProgressBar(-1);
            processDots[data.version_hash].hide();
            modal.alert("Ошибочка...", data.error, 'error', { logType: true });
        },
        progress: (data) => { // On progress
            const versionHash = data.version_hash;
            const progress = data.progress;
            if (data.progress > 0) {
                processDots[versionHash].hide();
                progressBars[versionHash].show();
            } else if (data.progress <= 0) {
                progressBars[versionHash].hide();
                processDots[versionHash].show();
            } else {
                progressBars[versionHash].setPrecentage(progress * 100);
            }
            setProgressBar(progress);
        },
        updateSystemTheme: (data) => { // On theme update
            updateTheme(data.theme);
        },
    }

    // Register electron events handling
    async function registerElectronEvents() {
        electron.on('open-settings', (e, data) => Events.openSettings(data)); // Open settings
        electron.on('startup-success', (e, data) => Events.startupSuccess(data)); // Success start event
        electron.on('startup-error', (e, data) => Events.startupError(data)); // Error while starting
        electron.on('error', (e, data) => Events.error(data)); // Programm error event
        electron.on('progress', (e, data) => Events.progress(data)); // Progress event
        electron.on('theme.update', (e, data) => Events.updateSystemTheme(data)); // Theme update event
        return true;
    }

    // Register Web events handling
    async function registerWebEvents() {
        let colorScheme = window.matchMedia('(prefers-color-scheme: dark)'); // Current web color scheme
        colorScheme.addEventListener("change", () => updateTheme()); // Register new eventListener for colorScheme change
        // code here
        return true;
    }
}
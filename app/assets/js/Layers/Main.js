// Imports
import { Layer } from "../Layer/Layer.js";
import { switchView, VIEWS } from "../Layer/LayerSwitcher.js";
import { isWeb, setProgressBar, updatePlatform, updateTheme } from "../scripts/Tools.js";
import { HomeContainer } from "./HomeContainer.js";
import { MainContainer } from "./MainContainer.js";


export function Main(props) {
    //Define main variables
    const mainContainer = new MainContainer(); // Main container of app
    const layer = new Layer({ label: '' }, mainContainer.content); // Create new layer
    layer.join(); // Join new layer

    VIEWS.main = layer.content; // Add main content to layer switcher

    window.addEventListener("load", async (event) => { // Register new eventListener for window load event
        setProgressBar(-1); // Resete window progress bar
        updatePlatform(window.system?.os); // Update platform
        updateTheme();
        if (!isWeb) {
            registerImpElectronEvents();
        } else {
            registerImpWebEvents();
        }
        setTimeout(() => switchView(VIEWS.main, 100, 100), 1000); // Switch view to main
    }, { once: true }); // Call it once and then destroy

    async function registerImpElectronEvents() {
        electron.on('theme.update', (e, data) => updateTheme(data.theme)); // Theme update event
        return true;
    }

    async function registerImpWebEvents() {
        let colorScheme = window.matchMedia('(prefers-color-scheme: dark)'); // Current web color scheme
        colorScheme.addEventListener("change", () => updateTheme()); // Register new eventListener for colorScheme change
        return true;
    }

    //mainContainer.init();
}
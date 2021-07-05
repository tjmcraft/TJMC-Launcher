// Imports
import { Layer } from "../Layer/Layer.js";
import { switchView, VIEWS } from "../Layer/LayerSwitcher.js";
import { modal } from "../Libs/AlertEx.js";
import { isWeb, setProgressBar, updatePlatform, updateTheme } from "../scripts/Tools.js";
import { Settings } from "../settings.js";
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
        setTimeout(() => switchView(VIEWS.main, 100, 100), 1000); // Switch view to main
    }, { once: true }); // Call it once and then destroy

    //mainContainer.init();
}
// Imports
import { Layer } from "../Layer/Layer.js";
import { switchView, VIEWS } from "../Layer/LayerSwitcher.js";
import { SVG } from "../scripts/svg.js";
import { isWeb, setProgressBar, updatePlatform, updateTheme } from "../scripts/Tools.js";
import { Settings } from "../settings.js";
import { MainBase } from "../ui/MainLayout.js";
import { HomeContainer } from "./HomeContainer.js";
import { MainContainer } from "./MainContainer.js";


export function Main(props) {
    //Define main variables
    const homeContainer = new HomeContainer(); // Home container of app
    const mainContainer = new MainContainer(); // Main container of app

    const guildsItems = [
        {
            type: 'item',
            svg: SVG('home'),
            click: () => {
                mainBase.update(homeContainer.content);
                homeContainer.init();
            },
            selected: true
        },
        {
            type: 'item',
            svg: SVG('play-circle'),
            click: () => {
                mainBase.update(mainContainer.content);
                mainContainer.init();
            }
        },
        {
            type: 'item',
            image: cE('img', {src: 'https://picsum.photos/48/48?h=33'}),
            click: () => {}
        },
        { type: 'separator' },
        {
            type: 'item',
            image: cE('img', {src: 'https://picsum.photos/48/48?h=44'}),
            click: () => {}
        }
    ];
    
    const mainBase = new MainBase(guildsItems, homeContainer.content); homeContainer.init();
    const layer = new Layer({ label: '' }, mainBase.content); // Create new layer
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

    const Events = {
        openSettings: (data) => new Settings(), // Open settings
        error: (data) => { // Programm error
            console.error(data);
            setProgressBar(-1);
            processDots[data.version_hash].hide();
            modal.alert("Ошибочка...", data.error, 'error', { logType: true });
        },
    }

    async function registerImpElectronEvents() {
        electron.on('open-settings', (e, data) => Events.openSettings(data)); // Open settings
        electron.on('error', (e, data) => Events.error(data)); // Programm error event
        electron.on('theme.update', (e, data) => updateTheme(data.theme)); // Theme update event
        return true;
    }

    async function registerImpWebEvents() {
        let colorScheme = window.matchMedia('(prefers-color-scheme: dark)'); // Current web color scheme
        colorScheme.addEventListener("change", () => updateTheme()); // Register new eventListener for colorScheme change
        return true;
    }

}
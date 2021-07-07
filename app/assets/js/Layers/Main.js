// Imports
import { Layer } from "../Layer/Layer.js";
import { switchView, VIEWS } from "../Layer/LayerSwitcher.js";
import { SVG } from "../scripts/svg.js";
import { isWeb, setProgressBar, updatePlatform, updateTheme } from "../scripts/Tools.js";
import { Settings } from "../settings.js";
import { MainBase } from "../ui/MainLayout.js";
import { HomeContainer } from "./HomeContainer.js";
import { CubeContainer } from "./CubeContainer.js";


export function Main(props) {

    const lP = '/app/';

    let views = {
        home: new HomeContainer(),
        main: new CubeContainer()
    };

    const navigateTo = url => {
        history.pushState(null, null, lP + url);
        router(lP + url);
    };

    const router = async (url) => {

        const routes = [
            { path: 'home', view: views.home },
            { path: 'minecraft', view: views.main }
        ];

        const potentialMatches = routes.map(route => {
            console.log(`Url: ${(url)}`);
            console.log(`Route: ${(lP + route.path)}`)
            return {
                route: route,
                isMatch: (url) === (lP + route.path)
            }
        });

        let match = potentialMatches.find(match => match.isMatch);

        if (!match) {
            navigateTo(routes[0].path);
            return;
        }

        const view = match.route.view;
        view.init();

        mainBase.update(view.content);
        mainBase.guilds.selectItem(match.route.path);
    }

    window.addEventListener("popstate", router);

    const guildsItems = [
        {
            id: 'home',
            type: 'item',
            svg: SVG('home'),
            click: () => navigateTo('home')
        },
        {
            type: 'item',
            svg: SVG('news'),
            click: () => {}
        },
        {
            type: 'item',
            svg: SVG('messages'),
            click: () => {}
        },
        {
            type: 'item',
            svg: SVG('user-friends'),
            click: () => {}
        },
        {
            type: 'item',
            svg: SVG('users'),
            click: () => {}
        },
        {
            type: 'item',
            svg: SVG('images'),
            click: () => {}
        },
        {
            type: 'item',
            svg: SVG('video'),
            click: () => {}
        },
        {
            type: 'item',
            svg: SVG('music'),
            click: () => {}
        },
        { type: 'separator' },
        {
            id: 'minecraft',
            type: 'item',
            svg: SVG('cube'),
            click: () => navigateTo('minecraft')
            
        },
        {
            type: 'item',
            image: cE('img', {src: 'https://picsum.photos/48/48?h=33'}),
            click: () => {}
        },
        {
            type: 'item',
            image: cE('img', {src: 'https://picsum.photos/48/48?h=44'}),
            click: () => {}
        }
    ];
    
    const mainBase = new MainBase(guildsItems, null);
    const layer = new Layer({ label: '' }, mainBase.content); // Create new layer
    layer.join(); // Join new layer

    router(location.pathname);

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
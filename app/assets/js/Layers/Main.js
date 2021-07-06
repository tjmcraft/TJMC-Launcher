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

    let views = {
        home: new HomeContainer(),
        main: new MainContainer()
    };

    const navigateTo = url => {
        history.pushState(null, null, url);
        router(url);
    };

    const router = async (url = null) => {
        const routes = [
            { path: '/home', view: views.home },
            { path: '/minecraft', view: views.main }
        ];

        const potentialMatches = routes.map(route => {
            return {
                route: route,
                isMatch: (url || location.pathname) === route.path
            }
        });

        let match = potentialMatches.find(match => match.isMatch);

        if (!match) {
            match = {
                route: routes[0],
                isMatch: true
            };
        }

        const view = match.route.view;
        view.init();

        mainBase.update(view.content);
    }

    window.addEventListener("popstate", router);

    const guildsItems = [
        {
            type: 'item',
            svg: SVG('home'),
            click: (e) => {
                //e.preventDefault();
                navigateTo('/home');
            },
            selected: true
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
            type: 'item',
            svg: SVG('cube'),
            click: (e) => {
                //e.preventDefault();
                navigateTo('/minecraft');
            }
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

    router();

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
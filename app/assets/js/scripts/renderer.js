import { MainContainer, user_panel } from '../panel.js';
import { Layer } from './Layer.js';
import { Settings } from '../settings.js';
import { currentView, VIEWS, switchView } from './LayerSwitcher.js';
import { getConfig, getInstallations } from './Tools.js';
import { currentVersion, refreshVersions } from '../ui/sidebar-main.js';
/* ================================= */

const main_container = MainContainer();
const main_layer = new Layer({ label: 'main-layer' });
main_layer.append(main_container);
main_layer.join();

/* --------------------------------- */
const plb = qsl('#playButton')
const topBar = qsl('#topBar')
const progressBar = qsl('#progress-bar')
/* ================================= */

console.debug('Renderer init')

VIEWS.landing = main_layer.content

/**
 * Creates new settings layer
 */
function openSettings() {
    new Settings()
}

plb.addEventListener('click', (e) => startMine(currentVersion))

async function startMine(version_hash = null) {
    console.log(`Starting minecraft with hash: ${version_hash}`);
    topBar.toggle(true);
    await electron.invoke('launch-mine', version_hash);
    topBar.toggle(false);
}

getConfig().then(config => {
    qsl('.sidebar-main').appendChild(user_panel(config.auth))
})

window.onload = function(e) {
    const preloader = qsl('#preloader')
    switchView(VIEWS.landing, 100, 100)
    setTimeout(() => {
        preloader.fadeOut(500, () => {
            preloader.remove()
            document.documentElement.classList.remove('preload')
        })
    }, 1000)
}


refreshVersions();

async function registerElectronEvents() {
    electron.on('open-settings', (e) => openSettings());
    electron.on('startup-error', (e, error) => {
        modal.alert('Ошибка при запуске', error, 'error', {
            logType: true
        });
    });
    electron.on('error', (e, error) => {
        console.error(error);
        modal.alert('Ошибка', error, 'error', {
            logType: true
        });
    });
    electron.on('progress', (e, progress) => progressBar.setValue(progress * 100))
    progressBar.setValue = (v) => progressBar.style.width = v + "%"
}
window.__STANDALONE__ && registerElectronEvents();
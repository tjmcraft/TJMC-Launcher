
import { Layer } from './Layer.js';
import { Settings } from '../settings.js';
import { currentView, VIEWS, switchView } from './LayerSwitcher.js';
import { getConfig, getInstallations, startMinecraft } from './Tools.js';
import { currentVersion, refreshVersions, MainContainer, sidebar_el } from '../ui/sidebar-main.js';
import { modal } from './AlertEx.js';
/* ================================= */

const main_layer = new Layer({ label: 'main-layer' });
MainContainer().then(elem => {
    main_layer.append(elem.content);
    main_layer.join();

    /* --------------------------------- */
        const plb = qsl('#playButton')
        /*const topBar = qsl('#topBar')*/
        /*const progressBar = qsl('#progress-bar')*/
    /* ================================= */

    plb.addEventListener('click', (e) => startMine(currentVersion));
    /*progressBar.setValue = (v) => progressBar.style.width = v + "%";*/
})

console.debug('Renderer init')

VIEWS.landing = main_layer.content

/**
 * Creates new settings layer
 */
function openSettings() {
    new Settings()
}

async function startMine(version_hash = null) {
    console.log(`Starting minecraft with hash: ${version_hash}`);
    
    await startMinecraft(version_hash);
    topBar.toggle(false);
}

window.onload = async function(e) {
    switchView(VIEWS.landing, 100, 100);
    const reg_ev = await (window.__STANDALONE__ ? registerElectronEvents() : registerWSEvents());
    const preloader = qsl('#preloader');
    if (reg_ev)
        setTimeout(() => {
            preloader.fadeOut(500, () => {
                preloader.remove();
                document.documentElement.classList.remove('preload');
            })
        }, 1000)
}

refreshVersions();

async function registerElectronEvents() {
    electron.on('open-settings', (e) => openSettings());
    electron.on('startup-error', (e, error) => {
        modal.alert('Что-то пошло не так...', error, 'error', { logType: true });
    });
    electron.on('error', (e, error) => {
        console.error(error);
        modal.alert('Ошибочка...', error, 'error', { logType: true });
    });
    electron.on('progress', (e, data) => {
        //console.debug(data);
        const progressBars = sidebar_el.progressBars();
        if (data.progress > 0) progressBars[data.version_hash].show()
        if (data.progress <= 0) progressBars[data.version_hash].hide()
        progressBars[data.version_hash].setPrecentage(data.progress * 100);
    });
    return true;
}

function registerWSEvents(attempt = 0) {
    return new Promise((resolve, reject) => {
        attempt++;
        if (attempt >= 3) {
            modal.alert("Ошибочка получается...", "Не возможно присоединиться к сокет-серверу вашего лаунчера!\n Возможно он не установлен или банально не запущен.\n Устраните неполадки и попробуйте снова!", null, {
                buttons: [
                    {
                        name: "Окей",
                        class: ['filled', 'colorBrand'],
                        closeOverlay: false,
                        callback: () => location.reload()
                    }
                ],
                escButton: false,
                allowOutsideClick: false
            });
            return reject(false);
        }
        const reconnect_timeout = 1;
        let ws = new WebSocket("ws://localhost:4836");
        ws.onopen = function (event) {
            ws.onmessage = function (event) {
                let msg = JSON.parse(event.data);
                //console.debug(msg);
                parseEvent(msg);
            }
            return resolve(true);
        };
        ws.onclose = function (e) {
            console.warn(`Socket is closed. Reconnect will be attempted in ${reconnect_timeout} second.`, e.reason);
            setTimeout(registerWSEvents(attempt), reconnect_timeout * 1000);
        };
        const parseEvent = (event) => {
            switch (event.type) {
                case 'startup-error':
                    modal.alert('Ошибка при запуске', event.data, 'error', {
                        logType: true
                    });
                    break;
                case 'error':
                    console.error(event.data);
                    modal.alert('Ошибка', event.data, 'error', {
                        logType: true
                    });
                    break;
                case 'progress':
                    //console.debug(event.data);
                    const progressBars = sidebar_el.progressBars();
                    if (event.data.progress > 0) progressBars[event.data.version_hash].show()
                    if (event.data.progress <= 0) progressBars[event.data.version_hash].hide()
                    progressBars[event.data.version_hash].setPrecentage(event.data.progress * 100);
                    break;
                default:
                    break;
            }
        };
    })
}
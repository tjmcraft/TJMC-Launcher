/* ================================= */

const sidebar_el = new SidebarMain();
const main_container = MainContainer();
qsl("#main-layer").append(main_container);

/* --------------------------------- */
const mvl = qsl('#main-version-list')
const plb = qsl('#playButton')
const topBar = qsl('#topBar')
const progressBar = qsl('#progress-bar')
const nickField = qsl('#nick')
const playButton = qsl('#playButton')
/* ================================= */

console.debug('Renderer init')

const VIEWS = {
    landing: qsl('#main-layer'),
    settings: qsl('#settings-layer')
}

var currentView

/**
 * Switch launcher views.
 * 
 * @param {String} next (requied) The ID of the next view container
 * @param {Number} currentFadeTime The fade out time for the current view
 * @param {Number} nextFadeTime The fade in time for the next view
 * @param {Function} onCurrentFade Callback function to execute when the current
 * view fades out.
 * @param {Function} onNextFade Callback function to execute when the next view
 * fades in.
 */
function switchView(next, currentFadeTime = 100, nextFadeTime = 100, onCurrentFade = () => {}, onNextFade = () => {}){
    let current = currentView
    currentView = next
    if (current) current.fadeOut(currentFadeTime, () => onCurrentFade())
    if (next) next.fadeIn(nextFadeTime, () => onNextFade())
}

/**
 * Creates new settings layer
 */
function openSettings() {
    new Settings()
}

plb.addEventListener('click', (e) => startMine())

async function startMine() {
    topBar.toggle(true);
    await electron.invoke('launch-mine', null);
    topBar.toggle(false);
}

electron.on('startup-error', (e, error) => showStartUpError(error));
function showStartUpError(error) {
    modal.alert('Ошибка при запуске', error, 'error', { logType: true });
}
electron.on('error', (e, error) => showError(error));
function showError(error) {
    console.error(error)
    modal.alert('Ошибка', error, 'error', { logType: true });
}

API.ConfigManager.getAuth().then((auth) => {
    qsl('.sidebar-main').appendChild(user_panel(auth))
})

/**
 * The function creates and returns tools container for overlay
 */
function createToolsContainer(click = () => {}) {
    let tools = cE('div', {class: ['tools', 'frame-fix'] })
    let overlayCloseButton = cE('div', {class: 'overlayCloseButton'}, SVG('cross'))
    overlayCloseButton.onclick = click
    let keycode = cE('div', {class: ['keycode'] }, 'ESC')
    tools.append(overlayCloseButton, keycode)
    return tools
}

electron.on('progress', (e, progress) => progressBar.setValue(progress*100))
progressBar.setValue = (v) => progressBar.style.width = v + "%"

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

async function refreshVersions() {
    const installations = await API.VersionManager.getInstallations();
    const installations_entries = Object.entries(installations);
    sidebar_el.removeAll();
    if (installations_entries.length > 0) {
        for (const [hash, params] of installations_entries) {
            sidebar_el.addItem({ hash: hash, ...params }, (item) => {
                selectVersion(item.hash);
            });
        }
    } else {
        sidebar_el.createFirstPage();
    }
    qsl('.localVersions').append(sidebar_el.content());

    const selected_installation = await API.ConfigManager.getVersion();
    selected_installation && renderSelectVersion(selected_installation);
    
};
refreshVersions();

function selectVersion(version_hash) {
    if (!version_hash) return false;
    API.ConfigManager.setVersion(version_hash)
    renderSelectVersion(version_hash);
}

async function renderSelectVersion(version_hash = null) {
    if (!version_hash || version_hash == null || typeof version_hash !== 'string') return false;
    console.debug(version_hash)
    const version = await API.VersionManager.getInstallation(version_hash);
    let m = qsl('.top-toolbar'),
        n = m.qsl('h2'),
        d = m.qsl('h5');
    sidebar_el.selectVersion(version_hash);
    n.innerText = version.name || version.hash
    d.innerText = version.type
}
if (window.__STANDALONE__ && window.system?.os) {
    qsl(".app-mount").prepend(FrameBar());
    qsl('.app-container').toggle(true, 'frame-fix');
}

switch (window.system?.os) {
    case 'windows':
        document.documentElement.classList.add('platform-win')
        break;
    case 'osx':
        document.documentElement.classList.add('platform-darwin')
        break;
    case 'linux':
        document.documentElement.classList.add('platform-linux')
        break;
    default:
        document.documentElement.classList.add('platform-web')
        break;
}

switch (window.system?.colorScheme || getPreferredColorScheme()) {
    case 'light':
        document.documentElement.classList.add('light-theme')
        break;
    default:
        document.documentElement.classList.add('dark-theme')
        break;
}

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
var currentVersion
var Installations

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

electron.on('open-settings', (e) => openSettings())
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

electron.on('startup-error', (e, error) => {
    modal.alert('Ошибка при запуске', error, 'error', { logType: true });
});

electron.on('error', (e, error) => {
    console.error(error);
    modal.alert('Ошибка', error, 'error', { logType: true });
});

async function getConfig() {
    return await electron.invoke('configuration.get');
}
async function setConfig(config) {
    return await electron.invoke('configuration.set', config);
}
async function getMem() {
    return await electron.invoke('system.mem');
}

getConfig().then(config => {
    qsl('.sidebar-main').appendChild(user_panel(config.auth))
})

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
    Installations = await electron.invoke('installations.get');
    const installations_entries = Object.entries(Installations);
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

    if (localStorage.version_hash && Object(Installations).hasOwnProperty(localStorage.version_hash)) { renderSelectVersion(localStorage.version_hash) }
    else if (installations_entries[0] && installations_entries[0][0]) { selectVersion(installations_entries[0][0]) }
    else false
};
refreshVersions();

function selectVersion(version_hash) {
    if (!version_hash) return false;
    localStorage.version_hash = version_hash;
    renderSelectVersion(version_hash);
}

async function renderSelectVersion(version_hash = null) {
    if (!version_hash || version_hash == null || typeof version_hash !== 'string') return false;
    currentVersion = version_hash
    console.debug(currentVersion)
    const version = await getInstallation(version_hash);
    let m = qsl('.top-toolbar'),
        n = m.qsl('h2'),
        d = m.qsl('h5');
    sidebar_el.selectVersion(version_hash);
    n.innerText = version.name || version.hash
    d.innerText = version.type
}

async function getInstallation(version_hash) {
    if (Installations && Object(Installations).hasOwnProperty(version_hash)) {
        return { hash: version_hash, ...Installations[version_hash] } || null;
    }
}

/**
 * Function returns current preferred color sheme
 * @returns scheme
 */
function getPreferredColorScheme() {
    if (window.matchMedia) {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        } else {
            return 'light';
        }
    }
    return 'light';
}
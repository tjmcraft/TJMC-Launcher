/* ================================= */

/* --------------------------------- */
const mvl = qsl('#main-version-list')
const avb = qsl('#add-version-button')
const stb = qsl('#settings-button')
const plb = qsl('#playButton')
const topBar = qsl('#topBar')
const progressBar = qsl('#progress-bar')
const nickField = qsl('#nick')
const playButton = qsl('#playButton')
/* ================================= */

console.log('Renderer init')

switch (API.getOS()) {
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
        break;
}

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
    let current = getCurrentView()
    currentView = next
    if (current)
        current.fadeOut(currentFadeTime, () => {
            onCurrentFade()
        })
    if (next)
        next.fadeIn(nextFadeTime, () => {
            onNextFade()
        })
}

/**
 * Returns current active view
 */
function getCurrentView(){
    return currentView
}

/**
 * Creates new settings layer
 */
function openSettings() {
    new Settings()
}

/**
 * Open web links in the user's default browser.
 */
document.addEventListener('click', (event) => {
    if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
      event.preventDefault()
      API.shell.openExternal(event.target.href)
    }
})

/**
 * Open setting by clicking a button
 */
stb.addEventListener('click', (e) => {
    openSettings()
})

plb.addEventListener('click', (e) => {
    API.startMine()
})

API.VersionManager.getLocalVersions().then((parsed) => { for (const cv in parsed) {
        mvl.addItem(parsed[cv])
    }
})

/**
 * The function creates and returns tools container for overlay
 */
function createToolsContainer() {
    let tools = createElementWithClass('div', 'tools frame-fix')
    let overlayCloseButton = createElementWithId('div', 'overlayCloseButton')
    let cross = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#dcddde" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"></path></svg>'
    let keycode = createElementWithClass('div', 'keycode')
    keycode.innerText = 'ESC'

    overlayCloseButton.innerHTML += cross
    tools.append(overlayCloseButton, keycode)

    return tools
}

mvl.addItem = function (item) {
    let c = this.qsl('.sidebar')
    let i = createElementWithClass('div', 'item navItem')
    i.setAttribute('item-data', item)
    i.innerHTML = item.id
    i.onclick = function() {
        console.debug(item)
        selectVersion(item)
    }
    c.append(i)
}
mvl.remItem = function (item) {
    let c = this.qsl('.sidebar')
    let i = c.qsl(`[item-data=${item}]`)
    c.removeChild(i)
}

function selectVersion(version) {
    let m = qsl('.top-toolbar'),
        n = m.qsl('h2'),
        d = m.qsl('h5')
    API.ConfigManager.setVersion(version)
    n.innerText = version.id
    d.innerText = version.type
}
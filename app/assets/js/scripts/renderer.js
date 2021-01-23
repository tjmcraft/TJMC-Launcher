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

avb.addEventListener('click', (e) => {
    new VersionChooser()
})

API.VersionManager.getLocalVersions().then((parsed) => { 
    for (const cv in parsed) {
        mvl.addItem(parsed[cv])
    }
})
API.VersionManager.getVersion().then((version) => {
    renderSelectVersion(version)
})
API.ConfigManager.getAuth().then((auth) => {
    renderNameTag(auth)
})

function renderNameTag(auth) {
    let c = qsl('.nameTag'),
        n = c.qsl('.title'),
        s = c.qsl('.subtitle')
    n.innerText = auth.username
    s.innerText = auth.permission
}

/**
 * The function creates and returns tools container for overlay
 */
function createToolsContainer(click = () => {}) {
    let tools = createElementWithClass('div', 'tools frame-fix')
    let overlayCloseButton = createElementWithId('div', 'overlayCloseButton')
    overlayCloseButton.onclick = click
    let cross = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#dcddde" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"></path></svg>'
    let keycode = createElementWithClass('div', 'keycode')
    keycode.innerText = 'ESC'

    overlayCloseButton.innerHTML += cross
    tools.append(overlayCloseButton, keycode)

    return tools
}

mvl.addItem = function (item) {
    let c = qsl('.sidebar')
    let i = createElementWithClass('div', 'item navItem')
    i.setAttribute('version-id', item.id)
    i.innerHTML = item.id
    i.onclick = function() {
        selectVersion(item)
    }
    c.append(i)
}
mvl.remItem = function (item) {
    let c = qsl('.sidebar')
    let i = c.qsl(`[version-id=${item.id}]`)
    c.removeChild(i)
}

function selectVersion(version) {
    API.ConfigManager.setVersion(version)
    renderSelectVersion(version)
}

function renderSelectVersion (version) {
    let m = qsl('.top-toolbar'),
        n = m.qsl('h2'),
        d = m.qsl('h5'),
        s = mvl.qsla('.sidebar .navItem')
    s.forEach((el) => {
        el.classList[el.getAttribute('version-id') === version.id ? 'add' : 'remove']('selected')
    })   
    n.innerText = version.id
    d.innerText = version.type
}

/*new AlertEx({
    closeButton: true,
    type: 'warn',
    header: 'Внимание!',
    text: `Это бета тест и некоторые функции не работают!`,
    buttons: [{
        class: '',
        name: 'Окей',
        callback: () => {
        },
        closeOverlay: true
    }]
})*/
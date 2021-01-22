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
    new AlertEx({
        closeButton: true,
        type: '',
        header: 'Header',
        text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum et gravida ligula. Mauris mattis ex sit amet metus gravida viverra. Proin dapibus dictum sapien vel maximus. Pellentesque volutpat ligula ac lorem accumsan finibus. Donec a turpis tempor, iaculis ante sed, faucibus orci. Vivamus molestie dui in sem ultricies, quis molestie justo porta. Nam a turpis dolor. Proin in iaculis enim. Vivamus leo diam, interdum in convallis rhoncus, placerat id turpis.

        Quisque sit amet aliquam dui. Phasellus risus ipsum, cursus eget efficitur ullamcorper, gravida eget turpis. Praesent euismod suscipit elit at vehicula. Ut ac libero a nisi finibus efficitur. Donec accumsan urna quis risus convallis tempus. Pellentesque consequat libero et dignissim semper. Duis molestie est nec magna ultricies, et rhoncus lacus posuere. Curabitur rutrum eget neque non accumsan. Donec sit amet porttitor turpis. Pellentesque at ligula iaculis, mollis sem sit amet, aliquet magna. Integer laoreet fringilla tincidunt. Duis tincidunt nec dui in suscipit. Phasellus pellentesque tristique elit quis scelerisque. Mauris vestibulum dui non nunc tempor, nec fringilla nisi venenatis. Nunc tempor suscipit purus posuere pulvinar. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
        
        Pellentesque ac velit nec leo mattis pulvinar. Nulla dolor leo, rhoncus in consectetur non, rhoncus eget libero. Pellentesque enim ex, pellentesque id ullamcorper vitae, iaculis vitae diam. Donec tempor eget enim et faucibus. Cras hendrerit ornare arcu ac pellentesque. Maecenas laoreet ipsum eros, sit amet dignissim tellus molestie et. Maecenas sagittis ligula est, quis ultrices lorem finibus eget. Ut ornare, justo feugiat ornare dapibus, lorem nulla venenatis turpis, non tincidunt erat metus sed dolor. Donec vehicula pulvinar ante, a aliquet nisi tincidunt id. Donec imperdiet mi vel libero interdum porttitor.
        
        Integer placerat finibus erat non fringilla. Nam a orci sit amet libero aliquet pulvinar. Quisque magna mi, mattis nec condimentum vitae, interdum vel mi. Fusce vitae nisi sed dui tincidunt finibus. Aliquam tincidunt ex vel suscipit iaculis. Pellentesque congue pretium est et commodo. Nullam nec orci laoreet, iaculis magna at, varius leo. Mauris vel euismod nibh, sit amet suscipit enim. Ut quis elit et ligula facilisis venenatis. Curabitur semper nisi quis nunc tempor convallis. Mauris ut erat nec libero egestas commodo. Sed ullamcorper, nulla a vulputate viverra, ipsum orci commodo libero, aliquam ullamcorper ex massa at leo. Nullam sed mi sit amet diam mollis semper ac quis nibh. Nunc quis nulla nunc.
        
        Duis eget orci magna. Vivamus aliquet neque dapibus fringilla aliquam. Aliquam scelerisque, elit a ornare ullamcorper, turpis dui commodo metus, sit amet fringilla mauris odio sit amet dui. Nam vulputate sagittis consequat. Suspendisse in nulla neque. Cras varius risus eget magna consequat, eget feugiat nulla molestie. Cras quis ipsum posuere, ultricies arcu sed, lobortis elit. Suspendisse at risus lorem. In a nunc ac arcu condimentum vehicula. In hac habitasse platea dictumst.`,
        buttons: [{
            class: '',
            name: 'Ok',
            callback: () => {}
        }]
    })
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
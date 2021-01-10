// Mapping of each view to their container IDs.
const VIEWS = {
    landing: '#frameMain',
    settings: '#frameSecond'
}

// The currently shown view container.
let currentView

/**
 * Switch launcher views.
 * 
 * @param {*} next The ID of the next view container.
 * @param {*} currentFadeTime Optional. The fade out time for the current view.
 * @param {*} nextFadeTime Optional. The fade in time for the next view.
 * @param {*} onBeforeFade Optional. Callback function to execute before animation starts
 * @param {*} onCurrentFade Optional. Callback function to execute when the current
 * view fades out.
 * @param {*} onNextFade Optional. Callback function to execute when the next view
 * fades in.
 */
function switchView(next, currentFadeTime = 100, nextFadeTime = 100, onBeforeFade = () => {}, onCurrentFade = () => {}, onNextFade = () => {}){
    onBeforeFade()
    let current = getCurrentView()
    currentView = next
    if (current)
        document.querySelector(`${current}`).back(currentFadeTime, () => {
            onCurrentFade()
        })
    if (next)
        document.querySelector(`${next}`).top(nextFadeTime, () => {
            onNextFade()
        })
}

/**
 * Get the currently shown view container.
 * 
 * @returns {string} The currently shown view container.
 */
function getCurrentView(){
    return currentView
}

/**
 * Functions toogle all elements using css
 * @param {boolean} s state to toggle (it can be null)
 */
Element.prototype.toggle = function(s = null) {
    let cl = this.classList,
        c = 'hidden'
    if (s != null ? s : cl.contains(c) == 1){
        cl.remove(c)
    } else {
        cl.add(c)
    }
}

/**
 * Open web links in the user's default browser.
 */
document.addEventListener('click', function (event) {
    if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
      event.preventDefault()
      shell.openExternal(event.target.href)
    }
})

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

function createElementWithId(el, id) {
    let e = document.createElement(el)
    e.id = id
    return e
}

function createElementWithClass(el, cl) {
    let e = document.createElement(el)
    e.className = cl
    return e
}
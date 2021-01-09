// Mapping of each view to their container IDs.
const VIEWS = {
    landing: '#frameMain',
    settings: '#frameSecond'
}

// The currently shown view container.
let currentView = VIEWS.settings

/**
 * Switch launcher views.
 * 
 * @param {string} current The ID of the current view container. 
 * @param {*} next The ID of the next view container.
 * @param {*} currentFadeTime Optional. The fade out time for the current view.
 * @param {*} nextFadeTime Optional. The fade in time for the next view.
 * @param {*} onCurrentFade Optional. Callback function to execute when the current
 * view fades out.
 * @param {*} onNextFade Optional. Callback function to execute when the next view
 * fades in.
 */
function switchView(current, next, currentFadeTime = 500, nextFadeTime = 500, onCurrentFade = () => {}, onNextFade = () => {}){
    currentView = next
    document.querySelector(`${current}`).back(currentFadeTime, () => {
        onCurrentFade()
        document.querySelector(`${next}`).top(nextFadeTime, () => {
            onNextFade()
        })
    })
    console.log(new APP_LAYERS())
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
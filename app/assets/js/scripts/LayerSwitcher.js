/**
 * Current View
 */
export var currentView;

/**
 * Views declaration
 */
export const VIEWS = {}

/**
 * Switch views
 * 
 * @param {String} next (requied) The ID of the next view container
 * @param {Number} currentFadeTime The fade out time for the current view
 * @param {Number} nextFadeTime The fade in time for the next view
 * @param {Function} onCurrentFade Callback function to execute when the current view fades out.
 * @param {Function} onNextFade Callback function to execute when the next view fades in.
 */
export function switchView(next, currentFadeTime = 100, nextFadeTime = 100, onCurrentFade = () => {}, onNextFade = () => {}) {
    let current = currentView
    currentView = next
    if (current) current.fadeOut(currentFadeTime, () => onCurrentFade())
    if (next) next.fadeIn(nextFadeTime, () => onNextFade())
}
/**
 * Functions toogle elements using css
 * @param {Boolean} state state to toggle TRUE/FALSE (it can be also null)
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
 * The alternative function to querySelector
 * - It's more compact
 * - Ignores null and undefined
 * - Also support multiple select
 * - You can select the inherit element with element.qsl()
 * @param {Object} selector - The selector + object to select
 */
function qsl(s) {
    if (typeof s !== 'undefined' && s != null) return document.querySelector(s)
}
Element.prototype.qsl = qsl

/**
 * The alternative function to querySelector
 * - It's more compact
 * - Ignores null and undefined
 * - Also support multiple select
 * - You can select the inherit element with element.qsl()
 * @param {Object} selector - The selector + object to select
 */
function qsla(s) {
    if (typeof s !== 'undefined' && s != null) return document.querySelectorAll(s)
}
Element.prototype.qsla = qsla

/**
 * Function creates new element with given ID
 * @param {Element} element - The type of element to create
 * @param {*} id - The ID for created element
 */
function createElementWithId(el, id) {
    let e = document.createElement(el)
    e.id = id
    return e
}

/**
 * Function creates new element with given ClassName
 * @param {Element} element - The type of element to create
 * @param {String} class - The ClassName for created element
 */
function createElementWithClass(el, cl) {
    let e = document.createElement(el)
    e.className = cl
    return e
}

/**
 * This function merging only arrays unique values. It does not merges arrays in to array with duplicate values at any stage.
 * - Function accept multiple array input (merges them to single array with no duplicates)
 * - it also can be used to filter duplicates in single array
 * @param {Object} arguments
 */
function merge (...args) {
    let set = new Set()
    for (let arr of args) {
        arr.map((value) => {
            set.add(value)
        })
    }
    return [...set]
}

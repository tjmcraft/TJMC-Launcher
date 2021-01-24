'use strict'
/**
 * Functions toogle elements using css
 * @param {Boolean} state state to toggle TRUE/FALSE (it can be also null)
 */
Element.prototype.toggle = function(s = null) {
    let cl = this.classList,
        c = 'hidden'
    cl[(s != null ? s : cl.contains(c) == 1) ? 'remove' : 'add'](c)
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
    if (typeof s !== 'undefined' && s != null) return (typeof this === 'object' && this.nodeName ? this : document).querySelector(s)
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
    if (typeof s !== 'undefined' && s != null) return (typeof this === 'object' && this.nodeName ? this : document).querySelectorAll(s)
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

Element.prototype.removeAllChildNodes = function() {
    let parent = this
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild)
    }
}

function randomInteger(max) {
    let min = 0
    let rand = min + Math.random() * (max + 1 - min)
    return Math.floor(rand)
}

function randomString(length) {
    var result           = ''
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

/**
 * Get Position of the element
 * @param {Element} Element - The element to get position to
 */
function getPos(el) {
    let x = 0,
        y = 0
    while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        x += el.offsetLeft - el.scrollLeft
        y += el.offsetTop - el.scrollTop
        el = el.offsetParent
    }
    return { top: y, left: x }
}
'use strict'
/**
 * Functions toogle elements using css
 * @param {Boolean} state state to toggle TRUE/FALSE (it can be also null)
 */
Element.prototype.toggle = function(s = null, cls = null) {
    let cl = this.classList,
        c = cls || 'hidden',
        e = (s != null ? s : cl.contains(c) == 1),
        ce = (cls != null)
    cl[(ce ? !e : e) ? 'remove' : 'add'](c)
}

/**
 * The alternative function to querySelector
 * - It's more compact
 * - Ignores null and undefined
 * - Also support multiple select
 * - You can select the inherit element with element.qsl()
 * @param {Object} selector - The selector + object to select
 * @return {Element} element
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
 * @return {Element} element
 */
function qsla(s) {
    if (typeof s !== 'undefined' && s != null) return (typeof this === 'object' && this.nodeName ? this : document).querySelectorAll(s)
}
Element.prototype.qsla = qsla

/**
 * Creates new element with given attributes
 * @param {String} tag - The element tag
 * @param {Object} attrs - The attributes for this element
 * @param  {Element} childrens - Childrens for element
 * @returns {Element} instance of element
 */
function createElement(tag, attrs, ...childrens) {
    var element = document.createElement((typeof tag == 'string') ? tag : 'div');
    var insert_html = false;
    for (const name in attrs) {
        if (name && attrs.hasOwnProperty(name)) {
            let value = attrs[name];
            if (value instanceof Array) { value = value.filter(e => e).join(' ') }
            if (name == 'html' && value == true) { insert_html = true; continue; }
            if (value === true) { element.setAttribute(name, name) }
            else if (value !== false && value != null) { element.setAttribute(name, value.toString())}
        }
    }
    for (const child of childrens) {
        if (child && child != null) {
            if (insert_html && child.nodeType == null) { element.innerHTML += child }
            else { element.append(child) }
        }
    }
    return element;
}

/**
 * Creates new svg element with given attributes
 * @param {Object} attrs - The attributes for this element
 * @param  {Element} childrens - Childrens for element
 * @returns {Element} instance of element
 */
function createSVGElement(attrs, ...childrens) {
    var element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    for (let name in attrs) {
        if (name && attrs.hasOwnProperty(name)) {
            let value = attrs[name];
            if (value === true) {
                element.setAttribute(name, name);
            } else if (value !== false && value != null) {
                element.setAttribute(name, value.toString());
            }
        }
    }
    for (let child of childrens) {
        if (child && child.nodeType != null) {
            element.appendChild(child);
        } else {
            element.innerHTML += child.toString();
        }
    }
    return element;
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

const on = (selector, eventType, childSelector, eventHandler) => {
    const elements = document.querySelectorAll(selector)
    for (element of elements) {
        element.addEventListener(eventType, eventOnElement => {
            if (eventOnElement.target.matches(childSelector)) {
                eventHandler(eventOnElement)
            }
        })
    }
}

const _on = (eventType, childSelector, eventHandler) => {
    document.addEventListener(eventType, eventOnElement => {
        //if (eventOnElement.target.matches(childSelector)) {
            eventHandler(eventOnElement)
        //}
    })
}

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}

/**
 * Clean object (remove null and undefined)
 */
function cleanObject(obj) {
    obj = obj || this;
    const emptyObject = {};
    Object.keys(obj).forEach(key => {
        if (obj[key] && typeof obj[key] === 'object') {
            emptyObject[key] = cleanObject(obj[key]);
        } else if (obj[key] != null && obj[key] != undefined) {
            emptyObject[key] = obj[key];
        }
    })
    return Object.keys(emptyObject)?.length > 0 ? emptyObject : undefined;
}
Object.prototype.clean = cleanObject

function naturalCompare(a, b) {
    var ax = [], bx = [];

    a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
    b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });
    
    while(ax.length && bx.length) {
        var an = ax.shift();
        var bn = bx.shift();
        var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
        if(nn) return nn;
    }

    return ax.length - bx.length;
}

function natsort(arr) {
    arr = arr || this;
    if (arr.isArray) {
        return arr.sort(naturalCompare);
    }
}
Array.prototype.natsort = natsort

/**
 * Sort a 2 dimensional array based on 1 or more indexes
 * 
 * @param {Array} arr - array to sort
 * @param {String|Array} key - The index(es) to sort the array on.
 * 
 * @return {Array} sorted array
 */
function msort(arr, key) {
    if (arr.isArray && arr.length > 0 && key != null) {
        let mapping = [];
        arr.forEach((v, k) => {
            let sort_key = '';
            if (!k.isArray) {
                sort_key = v[key];
            } else {
                key.forEach((key_key) => {
                    sort_key += v[key_key];
                })
            }
            mapping[k] = sort_key;
        })
        natsort(mapping);
        let sorted = [];
        mapping.forEach((v, k) => {
            sorted[k] = arr[k];
        })
        return sorted;
    }
    return arr;
}
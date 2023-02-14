'use strict'

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

/**
 * Get Position of the element
 * @param {Element} Element - The element to get position to
 */
export function getPos(el) {
    let x = 0,
        y = 0
    while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        x += el.offsetLeft - el.scrollLeft
        y += el.offsetTop - el.scrollTop
        el = el.offsetParent
    }
    return { top: y, left: x }
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
export function msort(arr, key) {
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
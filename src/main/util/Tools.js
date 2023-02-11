/**
 * This function merging only arrays unique values. It does not merges arrays in to array with duplicate values at any stage.
 * - Function accept multiple array input (merges them to single array with no duplicates)
 * - it also can be used to filter duplicates in single array
 * @param {Object} arguments
 */
exports.merge = function(...args) {
    let set = new Set()
    for (let arr of args) {
        arr && Array.isArray(arr) &&
            arr.map((value) => {
                set.add(value)
            })
    }
    return [...set]
}

exports.keySort = function (array, key, order) {
    const sort = {
        asc: (a, b) => {
            a[key].localeCompare(b[key], undefined, { numeric: true, sensitivity: 'base' })
        },
        desc: (a, b) => sort.asc(b, a),
    };
    array.sort(sort[order] || sort.asc);
    return array;
}

/**
 * Clean object (remove null and undefined)
 */
exports.cleanObject = function(obj) {
    obj = obj || this;
    const emptyObject = {};
    Object.keys(obj).forEach(key => {
        if (obj[key] && typeof obj[key] === 'object') {
            emptyObject[key] = exports.cleanObject(obj[key]);
        } else if (obj[key] != null && obj[key] != undefined) {
            emptyObject[key] = obj[key];
        }
    })
    return Object.keys(emptyObject)?.length > 0 ? emptyObject : undefined;
}

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
    if (Array.isArray(arr)) {
        return arr.sort(naturalCompare);
    }
}
exports.natsort = natsort;

/**
 * Sort a 2 dimensional array based on 1 or more indexes
 *
 * @param {Array} arr - array to sort
 * @param {String|Array} key - The index(es) to sort the array on.
 *
 * @return {Array} sorted array
 */
function msort(arr, key = undefined) {
    if (Array.isArray(arr) && arr.length > 0 && key != undefined) {
        return [...arr].sort((a, b) => {
            const a_value = a[key];
            const b_value = b[key];
            const compare = (a, b) => {
                return /^\d/.test(a) - /^\d/.test(b) ||
                a.localeCompare(b, undefined, { numeric: true });

            };
            return compare(a_value, b_value);
        });
    }
    return arr;
}

exports.msort = msort;
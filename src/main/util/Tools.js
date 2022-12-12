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

exports.randomInteger = function(max) {
    let min = 0
    let rand = min + Math.random() * (max + 1 - min)
    return Math.floor(rand)
}

exports.randomString = function(length) {
    var result           = ''
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
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
    if (arr.isArray) {
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

exports.msort = msort;
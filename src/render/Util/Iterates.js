export const pick = (object, keys) => keys.reduce((result, key) => {
	result[key] = object[key];
	return result;
}, {});

export const omit = (object, keys) => {
	const stringKeys = new Set(keys.map(String));
	const savedKeys = Object.keys(object).filter((key) => !stringKeys.has(key));
	return pick(object, savedKeys);
};

export function arePropsShallowEqual(currentProps, newProps) {

	if (currentProps === newProps) {
		return true;
	}

	const currentKeys = Object.keys(currentProps);
	const currentKeysLength = currentKeys.length;
	const newKeysLength = Object.keys(newProps).length;

	if (currentKeysLength !== newKeysLength) {
		return false;
	}

	if (currentKeysLength === 0) {
		return true;
	}

	for (let i = 0; i < currentKeysLength; i++) {
		const prop = currentKeys[i];
		if (currentProps[prop] !== newProps[prop]) return false;
	}

	return true;
}

export function getUnequalProps(currentProps, newProps) {
	const currentKeys = Object.keys(currentProps);
	const currentKeysLength = currentKeys.length;
	const newKeysLength = Object.keys(newProps).length;

	if (currentKeysLength !== newKeysLength) {
		return ['%LENGTH%'];
	}

	return currentKeys.reduce((res, prop) => {
		if (currentProps[prop] !== newProps[prop]) {
			res.push(`${prop}: ${currentProps[prop]} => ${newProps[prop]}`);
		}

		return res;
	}, []);
}


const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function is(x, y) {
	// SameValue algorithm
	if (x === y) { // Steps 1-5, 7-10
		// Steps 6.b-6.e: +0 != -0
		// Added the nonzero y check to make Flow happy, but it is redundant
		return x !== 0 || y !== 0 || 1 / x === 1 / y;
	} else {
		// Step 6.a: NaN == NaN
		return x !== x && y !== y;
	}
}

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
export function shallowEqual(objA, objB) {
	if (is(objA, objB)) {
		return true;
	}

	if (typeof objA !== 'object' || objA === null ||
		typeof objB !== 'object' || objB === null) {
		return false;
	}

	const keysA = Object.keys(objA);
	const keysB = Object.keys(objB);

	if (keysA.length !== keysB.length) {
		return false;
	}

	// Test for A's keys different from B.
	for (let i = 0; i < keysA.length; i++) {
		if (
			!hasOwnProperty.call(objB, keysA[i]) ||
			!is(objA[keysA[i]], objB[keysA[i]])
		) {
			return false;
		}
	}

	return true;
}

const stacksNotEqual = (a1, a2) => (
	Array.isArray(a1) && Array.isArray(a2) &&
	(
		(a1 == null || a2 == null) ||
		(
			a1.length !== a2.length ||
			a1.map((val, idx) => shallowEqual(val, a2[idx])).some(e => !e)
		)
	)
) || a1 !== a2;

export const stacksEqual = (a1, a2) => a1 === a2 || (
	a1 !== null && a2 !== null &&
	Array.isArray(a1) && Array.isArray(a2) &&
	a1.length === a2.length &&
	a1.map((val, idx) => shallowEqual(val, a2[idx])).every(e => e)
);

export const stacksDiff = (arr1, arr2) => arr1
	.filter(x => !arr2.includes(x))
	.concat(arr2.filter(x => !arr1.includes(x)));


function naturalCompare(a, b) {
	let ax = [], bx = [];

	a.replace(/(\d+)|(\D+)/g, (_, $1, $2) => { ax.push([$1 || Infinity, $2 || ""]); });
	b.replace(/(\d+)|(\D+)/g, (_, $1, $2) => { bx.push([$1 || Infinity, $2 || ""]); });

	while (ax.length && bx.length) {
		let an = ax.shift();
		let bn = bx.shift();
		let nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1], { numeric: true, sensitivity: 'base' });
		if (nn) return nn;
	}

	return ax.length - bx.length;
}

export const keySort = (array, key, order) => {
	array = [...array];
	const sort = {
		asc (a, b) {
			a = a[key].replace(/^\S+\W+/g, '');
			b = b[key].replace(/^\S+\W+/g, '');
			return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
		},
		desc (a, b) { return sort.asc(b, a); },
	};
	return array.sort(sort[order] || sort.asc);
};

/**
 * Clean object (remove null and undefined)
 */
export const cleanObject = function(obj) {
	obj = obj || this;
	const emptyObject = {};
	Object.keys(obj).forEach(key => {
		if (obj[key] && typeof obj[key] === 'object') {
			emptyObject[key] = cleanObject(obj[key]);
		} else if (obj[key] != null && obj[key] != undefined) {
			emptyObject[key] = obj[key];
		}
	});
	return Object.keys(emptyObject)?.length > 0 ? emptyObject : undefined;
};
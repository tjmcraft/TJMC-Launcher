/**
 * Generate random number (int)
 * @param {number} min minimum number
 * @param {number} max maximum number
 * @returns
 */
const randomInteger = (min = 0, max = 1) => Math.floor(min + Math.random() * (max + 1 - min));

/**
 * Generate random string with given length
 * @param {number} length
 * @returns
 */
const randomString = (length) => {
	let result = '';
	let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
};

/**
 * Generate uuid for object keys
 * @param {Object} obj any object
 * @returns {string}
 */
const generateIdFor = (obj) => {
	let id;

	do {
		id = String(Math.random()).replace('0.', 'id');
	} while (obj.hasOwnProperty(id));

	return id;
};

module.exports = { randomInteger, randomString, generateIdFor };
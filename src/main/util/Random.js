const randomInteger = (min = 0, max = 1) => Math.floor(min + Math.random() * (max + 1 - min));

const randomString = (length) => {
	let result = '';
	let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
};

const generateIdFor = (obj) => {
	let id;

	do {
		id = String(Math.random()).replace('0.', 'id');
	} while (obj.hasOwnProperty(id));

	return id;
};

exports.randomInteger = randomInteger;
exports.randomString = randomString;
exports.generateIdFor = generateIdFor;
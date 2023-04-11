const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

/**
 * Compare file hash with given
 * @param {fs.PathLike} file - Path to file
 * @param {string} hash - Compare hash string
 * @returns
 */
exports.checkFileHash = (file, hash) => new Promise((resolve, reject) => {
	const sha1 = crypto.createHash('sha1');
	fs.createReadStream(file).on('data', data => sha1.update(data)).on('end', () => resolve(sha1.digest('hex') == hash));
})
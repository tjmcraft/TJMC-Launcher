const got = require('got');

/**
 * Function just download a single file and return its body
 * @param url give url of file
 */
exports.downloadFile = async (url) => {
  try {
    const response = await got(url, { retry: { limit: 3 } });
    if (response.statusCode && response.statusCode != 200) throw new Error('Invalid status code <' + response.statusCode + '>');
    return JSON.parse(response.body);
  } catch (err) {
    console.warn(`Failed to download ${url} due to\n${err}.`);
    return {};
  }
}
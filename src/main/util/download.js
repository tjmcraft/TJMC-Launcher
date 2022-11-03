
const request = require('request');

/**
 * Function just download a single file and return its body
 * @param url give url of file
 */
exports.downloadFile = (url, retry = false) => {
  return new Promise((resolve, reject) => {
      request(url, async (error, response, body) => {
          if (error) {
              console.warn(`Failed to download ${url} due to\n${error}.` + ` Retrying... ${retry}`)
              if (retry) { await downloadFile(url, false) } else reject(error);
          } else if (response?.statusCode != 200) {
              reject('Invalid status code <' + response.statusCode + '>')
          } else resolve(body)
      })
  })
}
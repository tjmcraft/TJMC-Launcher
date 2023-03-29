const got = require('got');
const fs = require('fs');
const events = require('node:events');
events.setMaxListeners(500);


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

/**
 *
 * @param {string} url
 * @param {string} filePath
 * @param {boolean} retry
 * @param {Function} progressHandler
 * @param {AbortSignal} signal
 * @returns
 */
exports.downloadToFile = (url, filePath, retry = false, progressHandler = () => void 0, signal) => new Promise((resolve, reject) => {

  if (!url.includes('http')) return resolve(false);
  if (fs.existsSync(filePath) && fs.readFileSync(filePath).length > 0) {
    typeof progressHandler == 'function' && progressHandler({
      total: 1,
      current: 1,
      percent: 1,
    });
    return resolve(false);
  }

  const downloadStream = got.stream(url, { signal });
  const fileWriterStream = fs.createWriteStream(filePath);

  downloadStream
    .on("downloadProgress", ({ transferred, total, percent }) => {
      // const percentage = Math.round(percent * 100) / 100;
      typeof progressHandler == 'function' && progressHandler({
        total: total,
        current: transferred,
        percent: percent,
      });
      // console.debug(`progress: ${transferred}/${total} (${percentage}%)`);
    })
    .on("error", (error) => {
      console.error(`Download failed: ${error.message}`);
      resolve(false);
    });

  fileWriterStream
    .on("error", (error) => {
      console.error(`Could not write file to system: ${error.message}`);
      resolve(false);
    })
    .on("finish", () => {
      // console.log(`File downloaded to ${filePath}`);
      resolve(true);
    });

  downloadStream.pipe(fileWriterStream);
})
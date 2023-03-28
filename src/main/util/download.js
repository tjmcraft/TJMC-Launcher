const got = require('got');
const path = require('path');
const fs = require('fs');

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

exports.downloadToFile = (url, filePath, retry = false, progressHandler = () => void 0) => new Promise((resolve, reject) => {

  if (fs.existsSync(filePath) && fs.readFileSync(filePath).length > 0) return resolve(false);
  if (!url.includes('http')) return resolve(false);

  const downloadStream = got.stream(url);
  const fileWriterStream = fs.createWriteStream(filePath);

  downloadStream
    .on("downloadProgress", ({ transferred, total, percent }) => {
      const percentage = Math.round(percent * 100 * 100) / 100;
      typeof progressHandler == 'function' && progressHandler({
        total: total,
        current: transferred,
        percentage: percentage,
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
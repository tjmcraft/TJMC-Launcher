const got = require('got');
const fs = require('fs');
const path = require('node:path');
const events = require('node:events');
events.setMaxListeners(500);
const https = require('https');
const http = require('http');

const maxSockets = 128;

const httpsAgent = new https.Agent({ maxSockets: maxSockets, keepAlive: false });
const httpAgent = new http.Agent({ maxSockets: maxSockets, keepAlive: false });

/**
 * Post json body to url
 * @param {string} url url post to
 * @param {object} body body object
 * @returns {object}
 */
exports.postBody = async (url, body) => {
  try {
    const promise = got(url, { method: 'POST', form: body });
    console.debug("[postBody]", url, "<-", body);
    const response = await promise;
    if (response.statusCode && response.statusCode != 200) throw new Error('Invalid status code <' + response.statusCode + '>');
    return JSON.parse(response.body);
  } catch (err) {
    console.error('[postBody]', err);
    return {};
  }
}

/**
 * Function just download a single file and return its body
 * @param url give url of file
 */
exports.downloadFile = async (url, progressHandler = (e) => void 0) => {
  try {
    const promiseRequest = got(url, { retry: { limit: 3 }, agent: { https: httpsAgent, http: httpAgent } });
    promiseRequest.on('downloadProgress', ({ transferred, total, percent }) => {
      typeof progressHandler == 'function' && progressHandler({
        total: total,
        current: transferred,
        percent: percent,
      });
    })
    const response = await promiseRequest;
    if (response.statusCode && response.statusCode != 200) throw new Error('Invalid status code <' + response.statusCode + '>');
    return JSON.parse(response.body);
  } catch (err) {
    console.warn(`Failed to download ${url} due to\n${err}.`);
    return {};
  }
}

/**
 * Async download to file
 * @param {string} url - url to download
 * @param {string} filePath - path to save
 * @param {boolean} force - force download (overwrite if exists)
 * @param {Function} progressHandler - progress handler
 * @param {AbortSignal} [signal] - abort signal
 * @returns
 */
exports.downloadToFile = (
  url,
  filePath,
  force = false,
  progressHandler = (e) => void 0,
  signal = undefined
) => new Promise((resolve, reject) => {
  if (!url.includes('http')) return resolve(false);
  if (!force && (fs.existsSync(filePath) && fs.readFileSync(filePath).length > 0)) {
    typeof progressHandler == 'function' && progressHandler({
      total: 1,
      current: 1,
      percent: 1,
    });
    return resolve(true);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const downloadStream = got.stream(url, { signal: signal, agent: { https: httpsAgent, http: httpAgent } });
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
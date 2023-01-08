const child = require('child_process');
const { downloadFile } = require('../util/download');
const logger = LoggerUtil('%c[JavaManager]', 'color: #beb600; font-weight: bold');

const checkJava = function (java) {
  return new Promise(resolve => {
    let cmd = `"${java}" -version`;
    child.exec(cmd, {}, (error, stdout, stderr) => {
      if (error) {
        resolve({ run: false, message: error });
      } else {
        logger.debug(`Using Java (${java}) version ${stderr.match(/"(.*?)"/).pop()} ${stderr.includes('64-Bit') ? '64-Bit' : '32-Bit'}`);
        resolve({ run: true });
      }
    })
  })
}

/**
 * Load Mojang's launcher.json file.
 *
 * @returns {Promise.<Object>} Promise which resolves to Mojang's launcher.json object.
 */
const loadMojangLauncherData = function () {
  return new Promise((resolve, reject) => {
    downloadFile(`https://launchermeta.mojang.com/mc/launcher.json`)
      .then(response => resolve(response))
      .catch(e => resolve(null));
  })
}

/**
 * Fetch the last open JDK binary.
 *
 * HOTFIX: Uses Corretto 8 for macOS.
 * See: https://github.com/dscalzi/HeliosLauncher/issues/70
 * See: https://github.com/AdoptOpenJDK/openjdk-support/issues/101
 *
 * @param {string} major The major version of Java to fetch.
 *
 * @returns {Promise.<OpenJDKData>} Promise which resolved to an object containing the JRE download data.
 */
const latestOpenJDK = function (major = '8') {
    return this.latestAdoptium(major);
}

const latestAdoptium = function (major) {

  const majorNum = Number(major);
  const sanitizedOS = process.platform === 'win32' ? 'windows' : (process.platform === 'darwin' ? 'mac' : process.platform);
  const sanitizedArch = process.arch === 'x64' ? 'x64' : (process.arch === 'arm64' ? 'aarch64' : process.arch);
  const url = `https://api.adoptium.net/v3/assets/latest/${major}/hotspot?vendor=eclipse&os=${sanitizedOS}&architecture=${sanitizedArch}`

  return new Promise((resolve, reject) => {
    downloadFile(url).then((response) => {

      const targetBinary = body.find(entry => {
        return entry.version.major === majorNum
          && entry.binary.os === sanitizedOS
          && entry.binary.image_type === 'jdk'
          && entry.binary.architecture === sanitizedArch
      })

      if (targetBinary != null) {
        resolve({
          uri: targetBinary.binary.package.link,
          size: targetBinary.binary.package.size,
          name: targetBinary.binary.package.name
        })
      } else {
        resolve(null)
      }

    });
  });
}

exports.checkJava = checkJava;
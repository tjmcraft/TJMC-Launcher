const child = require('child_process');
const ConfigManager = require('../managers/ConfigManager');
const { downloadFile } = require('../util/download');
const LoggerUtil = require("../util/loggerutil");
const path = require('path');
const fs = require('fs');
const logger = LoggerUtil('%c[JavaManager]', 'color: #beb600; font-weight: bold');

exports.checkJava = function (java) {
  console.debug("Check java:", java);
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

const convertOSToJavaFormat = ElectronFormat => {
  switch (ElectronFormat) {
    case 'win32':
      return 'windows';
    case 'darwin':
      return 'mac';
    case 'linux':
      return 'linux';
    default:
      return false;
  }
};

const convertArchToJavaFormat = ElectronFormat => {
  switch (ElectronFormat) {
    case 'x64':
      return 'x64';
    case 'ia32':
      return 'x32';
    case 'arm':
      return 'arm';
    case 'arm64':
      return 'aarch64';
    default:
      return false;
  }
};

const parseRecommendedJava = function (manifest) {
  if (manifest.javaVersion) {
    return manifest.javaVersion;
  } else {
    return {
      component: 'jre-legacy',
      majorVersion: 8
    };
  }
}

const fetchJavaConfig = function (javaVersionCode) {
  const os = process.platform == "win32" ? "windows" : process.platform == "darwin" ? "mac-os" : "linux";
  const arch = os == "linux" ? "" : ((os == "mac-os" ? (process.arch == "arm64" ? "arm64" : "") : (process.arch == "x64" ? "x64" : "x86")));
  const pc = os + "-" + arch;
  return new Promise((resolve, reject) => {
    downloadFile("https://launchermeta.mojang.com/v1/products/java-runtime/2ec0cc96c44e5a76b9c8b7c39df7210883d12871/all.json").then((response) => {
      if (!Object.keys(response).includes(pc)) return reject("Unsupported platform");
      if (!response[pc][javaVersionCode]) return reject("Unsupported java version");
      resolve(response[pc][javaVersionCode][0]);
    })
  });
}

const downloadJava = function (javaVersionCode) {
  return new Promise((resolve, reject) => {
    const javaPath = path.join(ConfigManager.getLauncherDirectory(), "java", javaVersionCode, "bin");
    if (fs.existsSync(javaPath)) {
      return resolve(javaPath);
    } else {
      fetchJavaConfig(javaVersionCode).then(async (config) => {
        const manifest = await downloadFile(config.manifest.url);
        const files = Object.keys(manifest.files).map((file) => {
          return { name: file, downloads: manifest.files[file].downloads, type: manifest.files[file].type };
        });
        const directory = files.filter((file) => file.type == "directory");
        const filesToDownload = files.filter((file) => file.type == "file");

        let javaDirs = [ConfigManager.getLauncherDirectory(), "java", javaVersionCode];
        javaDirs.forEach((dir, i) => {
          let _dir = javaDirs.slice(0, i + 1).join(path.sep);
          if (!fs.existsSync(_dir)) {
            fs.mkdirSync(_dir);
          }
        });

        directory.forEach((dir) => {
          fs.mkdirSync(path.join(ConfigManager.getLauncherDirectory(), "java", javaVersionCode, dir.name));
        });

        console.debug(">", manifest);
        console.debug(">>", files);
        resolve(true);
      });
    }
  });
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

exports.getRecommendedJava = async (manifest) => {
  const recommendedJava = parseRecommendedJava(manifest);
  await downloadJava(recommendedJava.component);
  return undefined;
}
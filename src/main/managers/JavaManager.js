const child = require('child_process');
const ConfigManager = require('../managers/ConfigManager');
const { downloadFile, downloadToFile } = require('../util/download');
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
  console.debug("Download Java:", javaVersionCode);
  return new Promise((resolve, reject) => {
    const javaPath = path.join(ConfigManager.getLauncherDirectory(), "java", javaVersionCode, "bin", `java${process.platform == "win32" ? ".exe" : ""}`);
    if (fs.existsSync(javaPath) && exports.checkJava(javaPath)['run'] != false) {
      return resolve(javaPath);
    } else {
      fetchJavaConfig(javaVersionCode).then(async (config) => {
        try {
          const manifest = await downloadFile(config.manifest.url);
          const files = Object.keys(manifest.files).map((file) => {
            return { name: file, downloads: manifest.files[file].downloads, type: manifest.files[file].type };
          });
          const directory = files.filter((file) => file.type == "directory");
          const filesToDownload = files.filter((file) => file.type == "file");

          console.debug(">", manifest);
          console.debug(">>", files);

          let javaDirs = [ConfigManager.getLauncherDirectory(), "java", javaVersionCode];
          javaDirs.forEach((dir, i) => {
            let _dir = javaDirs.slice(0, i + 1).join(path.sep);
            if (!fs.existsSync(_dir)) {
              fs.mkdirSync(_dir);
            }
          });

          directory.forEach((dir) => {
            const _dir = path.join(ConfigManager.getLauncherDirectory(), "java", javaVersionCode, dir.name);
            if (!fs.existsSync(_dir)) {
              fs.mkdirSync(_dir);
            }
          });

          let downloadedFiles = 0;

          await Promise.all(filesToDownload.map(async file => {
            await downloadToFile(file.downloads["raw"].url, path.join(ConfigManager.getLauncherDirectory(), "java", javaVersionCode, file.name));
            downloadedFiles++;
          }))

          resolve(javaPath);

        } catch (e) {
          return reject(e);
        }

      });
    }
  });
}

exports.getRecommendedJava = async (manifest) => {
  const recommendedJava = parseRecommendedJava(manifest);
  return await downloadJava(recommendedJava.component);
}
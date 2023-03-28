const child = require('child_process');
const { downloadFile, downloadToFile } = require('../util/download');
const LoggerUtil = require("../util/loggerutil");
const path = require('path');
const fs = require('fs');
const EventEmitter = require('events');
const logger = LoggerUtil('%c[JavaManager]', 'color: #beb600; font-weight: bold');

class JavaManager extends EventEmitter {

  constructor(rootDir) {
    super();
    this.rootDir = rootDir;
  }

  checkJava = function (java) {
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

  parseRecommendedJava = (manifest) => {
    if (manifest.javaVersion) {
      return manifest.javaVersion;
    } else {
      return {
        component: 'jre-legacy',
        majorVersion: 8
      };
    }
  }

  fetchJavaConfig = (javaVersionCode) => {
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

  downloadJava = (javaVersionCode) => {
    console.debug("Download Java:", javaVersionCode);
    return new Promise((resolve, reject) => {
      const javaPath = path.join(this.rootDir, "java", javaVersionCode, "bin", `java${process.platform == "win32" ? ".exe" : ""}`);
      if (fs.existsSync(javaPath) && this.checkJava(javaPath)['run'] != false) {
        return resolve(javaPath);
      } else {
        this.fetchJavaConfig(javaVersionCode).then(async (config) => {
          try {
            const manifest = await downloadFile(config.manifest.url);
            const files = Object.keys(manifest.files).map((file) => ({
              name: file,
              downloads: manifest.files[file].downloads,
              type: manifest.files[file].type,
            }));
            const directory = files.filter((file) => file.type == "directory");
            const filesToDownload = files.filter((file) => file.type == "file");

            const javaDir = path.join(this.rootDir, "java", javaVersionCode);
            if (!fs.existsSync(javaDir)) fs.mkdirSync(javaDir, { recursive: true });

            directory.forEach((dir) => {
              const _dir = path.join(javaDir, dir.name);
              if (!fs.existsSync(_dir)) fs.mkdirSync(_dir);
            });

            let downloadedFiles = 0;

            await Promise.all(filesToDownload.map(async file => {
              await downloadToFile(file.downloads["raw"].url, path.join(javaDir, file.name));
              downloadedFiles++;
              this.emit('download-progress', {
                current: downloadedFiles,
                total: filesToDownload.length,
              });
            }));

            resolve(javaPath);
          } catch (e) {
            return reject(e);
          }
        });
      }
    });
  }

  getRecommendedJava = async (manifest) => {
    const recommendedJava = this.parseRecommendedJava(manifest);
    return await this.downloadJava(recommendedJava.component);
  }

}


module.exports = JavaManager;
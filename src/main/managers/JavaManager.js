const child = require('child_process');
const { downloadFile, downloadToFile } = require('../util/download');
const LoggerUtil = require("../util/loggerutil");
const path = require('path');
const fs = require('fs');
const EventEmitter = require('node:events');
const { promisify } = require('util');
const logger = LoggerUtil('%c[JavaManager]', 'color: #beb600; font-weight: bold');

class JavaManager extends EventEmitter {

  constructor(rootDir) {
    super();
    this.rootDir = rootDir;
    this.runtimeManifest = undefined;
  }

  checkJava = function (java) {
    console.debug("Check java:", java);
    return new Promise(resolve => {
      if (java == void 0) return resolve({ run: false });
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

  fetchRuntimeManifest = async () => {
    if (this.runtimeManifest != undefined) return this.runtimeManifest;
    this.runtimeManifest = await downloadFile("https://launchermeta.mojang.com/v1/products/java-runtime/2ec0cc96c44e5a76b9c8b7c39df7210883d12871/all.json");
    return this.fetchRuntimeManifest();
  }

  pickCurrentPlatform = (runtimeManifest, javaVersionCode, os = undefined, arch = undefined) => {
    os = os != void 0 ? os : (process.platform == "win32" ? "windows" :
      process.platform == "darwin" ? "mac-os" :
        "linux");
    arch = arch != void 0 ? arch : (os == "linux" ? "" :
      (
        (os == "mac-os" ?
          (process.arch == "arm64" ? "arm64" : "") :
          (process.arch == "x64" ? "x64" : "x86")
        )
      ));
    const pc = os + (arch ? ("-" + arch) : "");
    if (!Object.keys(runtimeManifest).includes(pc)) throw new Error("Unsupported platform");
    if (runtimeManifest[pc][javaVersionCode].length == 0) {
      if (os == 'mac-os' && arch == 'arm64') // to run x64 java on arm64 through Rosetta 2
        return this.pickCurrentPlatform(runtimeManifest, javaVersionCode, os, "");
      throw new Error("Unsupported java version");
    }
    return runtimeManifest[pc][javaVersionCode][0];
  }

  /**
   * Download mojang jre by component code
   * @param {string} javaVersionCode
   * @param {AbortSignal} [signal]
   * @returns
   */
  downloadJava = async (javaVersionCode, signal = undefined) => {
    console.debug("Download Java:", javaVersionCode);
    const javaDir = path.join(this.rootDir, "java", javaVersionCode);
    const javaPath = path.join(javaDir, ...(process.platform == "darwin" ? ["jre.bundle","Contents","Home"] : []), "bin", `java${process.platform == "win32" ? ".exe" : ""}`);
    if (fs.existsSync(javaPath) && (await this.checkJava(javaPath))['run'] != false) {
      return javaPath;
    }
    const runtimeManifest = await this.fetchRuntimeManifest(javaVersionCode);
    const currentPlatformManifest = this.pickCurrentPlatform(runtimeManifest, javaVersionCode);
    if (signal?.aborted) return undefined;
    if (!currentPlatformManifest) throw new Error("Unknown java error");
    try {
      const manifest = await downloadFile(currentPlatformManifest.manifest.url);
      const files = Object.keys(manifest.files).map((file) => ({
        name: file,
        downloads: manifest.files[file].downloads,
        type: manifest.files[file].type,
        executable: manifest.files[file].executable,
      }));
      const directory = files.filter((file) => file.type == "directory");
      const filesToDownload = files.filter((file) => file.type == "file");
      if (signal?.aborted) return undefined;
      if (!fs.existsSync(javaDir)) fs.mkdirSync(javaDir, { recursive: true });

      directory.forEach((dir) => {
        const _dir = path.join(javaDir, dir.name);
        if (!fs.existsSync(_dir)) fs.mkdirSync(_dir);
      });

      let totalProgress = 0;
      const useProgressCounter = () => {
        let prev = 0;
        return ({ percent }) => {
          totalProgress += percent - prev;
          this.emit('download-progress', {
            current: totalProgress,
            total: filesToDownload.length,
          });
          prev = percent;
        }
      }

      await Promise.all(filesToDownload.map(async file => {
        if (signal?.aborted) return undefined;
        const fileName = path.join(javaDir, file.name);
        if (!fs.existsSync(path.join(fileName, '..'))) fs.mkdirSync(path.join(fileName, '..'), { recursive: true });
        const handleProgress = useProgressCounter();
        await downloadToFile(file.downloads["raw"].url, fileName, false, handleProgress, signal);
        handleProgress({ percent: 1 });
        if (file.executable && process.platform != "win32") {
          await promisify(child.exec)(`chmod +x "${fileName}"`);
          await promisify(child.exec)(`chmod 755 "${fileName}"`);
        }
      }));

      if (signal?.aborted) return undefined;

      return javaPath;
    } catch (e) {
      throw e;
    }
  }

  getRecommendedJava = (manifest) =>
    manifest.javaVersion || { component: 'jre-legacy', majorVersion: 8 };

}


module.exports = JavaManager;
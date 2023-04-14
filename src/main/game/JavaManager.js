const fs = require('node:fs');
const path = require('node:path');
const child = require('node:child_process');
const { promisify } = require('node:util');
const exec = promisify(child.exec);
const EventEmitter = require('node:events');
const { downloadFile, downloadToFile } = require('../util/download');
const { checkFileHash } = require('../util/Crypto');
const logger = require("../util/loggerutil")('%c[JavaManager]', 'color: #beb600; font-weight: bold');

class JavaManager extends EventEmitter {

  constructor(rootDir) {
    super();
    this.rootDir = rootDir;
    this.runtimeManifest = undefined;
  }

  checkJava = async function (java) {
    if (java != void 0) {
      let cmd = `"${java}" -version`;
      try {
        const { error, stdout, stderr } = await exec(cmd);
        if (error) {
          return ({ run: false, message: error });
        } else {
          return ({ run: true, version: stderr.match(/"(.*?)"/).pop(), arch: stderr.includes('64-Bit') ? '64-Bit' : '32-Bit' });
        }
      } catch (e) {}
    }
    return ({ run: false });
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
   * @typedef RecommendedJava
   * @type {object}
   * @property {string} component Java component code
   * @property {number} majorVersion Major version java code
   */

  /**
   * Pick recommended java from version manifest
   * @param {object} manifest Manifest object
   * @returns {RecommendedJava}
   */
  pickRecommended = (manifest) =>
    manifest.javaVersion || { component: 'jre-legacy', majorVersion: 8 };

  getJavaPath = (javaVersionCode) => {
    const javaDir = path.join(this.rootDir, "java", javaVersionCode);
    const javaPath = path.join(javaDir, ...(process.platform == "darwin" ? ["jre.bundle", "Contents", "Home"] : []), "bin", `java${process.platform == "win32" ? ".exe" : ""}`);
    return { javaDir, javaPath };
  }

  /**
   * Download mojang jre by component code
   * @param {string} javaVersionCode
   * @param {AbortSignal} [signal]
   * @returns
   */
  downloadJava = async (javaVersionCode, signal = undefined) => {
    const { javaDir, javaPath } = this.getJavaPath(javaVersionCode);
    this.emit('download-progress', { current: 0, total: 1 });
    logger.debug("Download Java:", javaVersionCode);
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
        const filePath = path.join(javaDir, file.name);
        if (!fs.existsSync(path.join(filePath, '..'))) fs.mkdirSync(path.join(filePath, '..'), { recursive: true });
        const handleProgress = useProgressCounter();
        if (!fs.existsSync(filePath) || !await checkFileHash(filePath, file.downloads["raw"].sha1)) {
          await downloadToFile(file.downloads["raw"].url, filePath, true, handleProgress, signal);
          if (file.executable && process.platform != "win32") {
            await exec(`chmod +x "${filePath}"`);
            await exec(`chmod 755 "${filePath}"`);
          }
        } else {
          handleProgress({ percent: 1 });
        }
      }));

      if (signal?.aborted) return undefined;
      logger.debug("Downloaded Java:", javaVersionCode, "=>", javaPath);
      if ((await this.checkJava(javaPath))['run'] != false) {
        return javaPath;
      }
      return undefined;
    } catch (e) {
      throw e;
    }
  }

  getRecommendedJava = (javaVersionCode) => {
    const { javaDir, javaPath } = this.getJavaPath(javaVersionCode)
    if (fs.existsSync(javaPath)) {
      this.emit('download-progress', { current: 0.5, total: 1 });
      return javaPath;
    }
  }

}


module.exports = JavaManager;
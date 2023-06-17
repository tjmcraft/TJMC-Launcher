const fs = require('fs')
const path = require('path')
const os = require('os')
const Zip = require('adm-zip')
const EventEmitter = require('events')
const { downloadToFile } = require('../util/download')
const { checkFileHash } = require('../util/Crypto')
const { debounce, throttle } = require('../util/Shedulers')
const logger = require('../util/loggerutil')('%c[MinecraftCore]', 'color: #be1600; font-weight: bold')

const MC_RES_URL = "https://resources.download.minecraft.net";

/**
 * @typedef {string} FileType
 */

/**
 * Download queue manager
 * @param {Function} progressHandler - progress handler
 * @returns {ClassDecorator}
 */
const DownloadQueue = function (progressHandler = () => void 0) {

    progressHandler = typeof progressHandler === 'function' ? progressHandler : () => void 0;

    let totalBytes = 0;
    let loadedBytes = 0;
    let startTime = new Date().getTime();

    const isValidUrl = (url) => url != void 0 && url.includes('http');

    const debugTotal = throttle((e) => console.debug("[DQ]", "total:", e), 100, false);
    const useProgressCounter = (size, type) => {
        let prevBytes = 0;
        let prevTotalBytes = 0;
        if (size > 0) totalBytes += size;
        return ({ percent, total, current }) => {
            const duration = (new Date().getTime() - startTime) / 1000;
            if (size <= 0) {
                total = total ?? 0;
                totalBytes += total - prevTotalBytes;
            }
            if (prevTotalBytes != total) debugTotal(totalBytes);
            prevTotalBytes = total;
            if (current > 0) {
                loadedBytes += current - prevBytes;
            }
            prevBytes = current;

            const bps = loadedBytes / duration;
            const time = (totalBytes - loadedBytes) / bps;
            debugTotal(loadedBytes + "/" + totalBytes);
            progressHandler && progressHandler({
                current: loadedBytes,
                total: totalBytes,
                time: time,
                type: type,
            });
        }
    }

    /**
     * Async work on unit
     * @param {DownloadUnit} unit download unit
     * @param {AbortSignal} signal - abort signal
     * @returns {void}
     */
    const workOnUnit = async (unit, signal) => {
        const handleProgress = useProgressCounter(unit.size, unit.type);
        if (typeof unit.url === 'string') {
            return await downloadToFile(unit.url, unit.filePath, true, handleProgress, signal);
        } else if (Array.isArray(unit.url)) {
            for (const url of unit.url) {
                if (signal?.aborted) return;
                const loaded = await downloadToFile(url, unit.filePath, true, handleProgress, signal);
                // console.debug("[DQ]", loaded ? "downloaded" : "failed", unit.name, "->", url);
                if (loaded) return loaded;
            }
        }
        return undefined;
    };

    /**
     * Queue of units
     * @type {Array.<DownloadUnit>}
     */
    const queue = [];

    /**
     * @typedef DownloadUnit
     * @type {object}
     * @property {FileType} type - file type mark
     * @property {number} size - expected file size
     * @property {import('fs').PathLike} filePath - file path
     * @property {string|Array.<string>} url - file url
     */

    /**
     * Push new unit to download queue
     * @param {DownloadUnit} unit
     */
    this.push = async (unit) => {
        if (queue.find(e => e.url == unit.url && e.path == unit.path)) return;
        return queue.push(Object.assign({
            type: 'file',
            size: 0,
        }, unit));
    };

    /**
     * Start queue loading
     * @param {AbortSignal} [signal] - abort signal
     * @returns {Promise.<void>}
     */
    this.load = async (signal = undefined) => {
        startTime = new Date().getTime();
        // totalBytes = queue.reduce((a, c) => a + c.size, 0);
        let promises = queue.map(unit => workOnUnit(unit, signal));
        let result = await Promise.all(promises);
        return result.every(Boolean);
    };

    return this;
}

class Minecraft extends EventEmitter {

    /**
     * @typedef MinecraftOptions
     * @type {object}
     * @property {object} overrides - Object that describes overrides
     * @property {object} overrides.path - Object that describes all path overrides
     * @property {string} overrides.path.versions - Path to version directory (where main jar located)
     * @property {string} overrides.path.minecraft - Path to minecraft (root) directory
     * @property {string} overrides.path.gameDirectory - Path to game directory
     * @property {string} mcPath - Path to main jar
     * @property {import('../managers/InstallationsManager').Installation} installation - Installation object
     * @property {object} java - Minecraft java options
     * @property {object} java.memory - Minecraft java memory options
     * @property {number} java.memory.min - Minecraft minimum java memory
     * @property {number} java.memory.max - Minecraft maximum java memory
     * @property {object} auth - Minecraft auth
     * @property {object} auth.access_token - Minecraft auth token
     * @property {object} auth.uuid - Minecraft auth uuid (offline)
     * @property {object} auth.username - Minecraft auth username
     * @property {object} auth.user_properties - Minecraft auth user properties
     */

    /**
     * @type {MinecraftOptions}
     */
    options = {};

    /**
     * Minecraft constructor
     * @param {MinecraftOptions} options - Options to construct the launcher
     */
    constructor(options) {
        super();

        this.debug = false;
        logger.disabled = !this.debug;
        this.options = options;
        this.javaSeparator = process.platform === 'win32' ? ';' : ':';
        this.checkHash = this.options.installation.checkHash ?? true;
        this.checkFiles = this.options.installation.checkFiles ?? true;
        this.overrides = {
            resolution: {
                width: this.options.installation.resolution.width ?? 854,
                height: this.options.installation.resolution.height ?? 480,
                fullscreen: this.options.installation.resolution.fullscreen ?? false,
            },
            version: {
                name: this.options.installation.lastVersionId,
                type: this.options.installation.type,
            },
            autoConnect: this.options.installation.autoConnect ?? false,
            javaArgs: this.options.installation.javaArgs ?? '',
        };

        const handleProgress = ({ current, total, time, type }) => this.emit('download', {
            current: current,
            total: total,
            time: time,
            type: type,
        });
        this.downloadQueue = new DownloadQueue(handleProgress);
    }

    /**
     * Loads main client jar
     * @param {object} version Main version JSON
     */
    async loadClient(version) {
        if (this.checkFiles && (
            !fs.existsSync(this.options.mcPath) ||
            (this.checkHash && !await checkFileHash(this.options.mcPath, version.downloads.client.sha1))
        )) {
            this.downloadQueue.push({
                type: 'version-jar',
                size: version.downloads.client.size,
                url: version.downloads.client.url,
                filePath: this.options.mcPath
            });
        }
        return this.options.mcPath;
    }

    /**
     * Function get and download natives
     * @param {object} version Main version JSON
     */
    async getNatives(version) {
        let count = 0;
        const librariesDirectory = path.join(this.options.overrides.path.minecraft, 'libraries');
        const stat = version.libraries
            .filter(lib => lib.classifiers || lib.downloads?.classifiers)
            .filter(lib => !this.parseRule(lib))
            .filter(Boolean);
        const natives = await Promise.all(stat.map(async (library, index) => {
            const native = (library.classifiers || library.downloads?.classifiers)[library.natives[this.getOS()]];
            const lib = library.name.split(':');
            const nativePath = native.path || path.join(`${lib[0].replace(/\./g, '/')}/${lib[1]}/${lib[2]}`,
                `${lib[1]}-${lib[2]}${lib[3] ? '-' + lib[3] : ''}-${library.natives[this.getOS()]}.jar`);
            const filePath = path.join(librariesDirectory, nativePath);
            if (this.checkFiles && (
                !fs.existsSync(filePath) ||
                (this.checkHash && !await checkFileHash(filePath, native.sha1))
            )) {
                (index <= 0) && logger.debug(`Downloading natives...`);
                this.downloadQueue.push({
                    type: 'natives',
                    size: native.size,
                    url: native.url,
                    filePath: filePath,
                });
            }
            count++;
            this.checkFiles && this.emit('progress', {
                type: 'natives',
                task: count,
                total: stat.length,
            });
            return filePath;
        }));

        this.emit('progress', {
            type: 'natives',
            task: stat.length,
            total: stat.length,
        });

        logger.debug(`Natives Collected: ${natives.length}`);
        return natives;
    }

    /**
     * Extract natives jars to dir
     * @param {Array} natives
     */
    async extractNatives(natives) {
        const nativesDirectory = path.resolve(path.join(this.options.overrides.path.version, 'natives'));
        fs.mkdirSync(nativesDirectory, { recursive: true });
        await Promise.all(natives.map(async (native) => {
            console.debug("[natives]", native);
            try {
                new Zip(native).extractAllTo(nativesDirectory, true)
            } catch (e) { logger.warn(e) }
        }));
        return nativesDirectory;
    }

    /**
     * Function getting and download assets
     * @param version Main version JSON
     */
    async getAssets(version) {
        let count = 0;
        const assetDirectory = path.resolve(path.join(this.options.overrides.path.minecraft, 'assets'));
        const assetsIndexPath = path.join(assetDirectory, 'indexes', `${version.assetIndex.id}.json`);
        if (!fs.existsSync(assetsIndexPath)) await downloadToFile(version.assetIndex.url, assetsIndexPath, true);
        const index = JSON.parse(fs.readFileSync(assetsIndexPath, { encoding: 'utf8' }));

        const emitProgress = (e) => this.emit('progress', {
            type: 'assets', ...e
        });

        const assetProcessor = async (asset, number) => {
            const { hash, size } = index.objects[asset];
            const subHash = hash.substring(0, 2);
            const subAsset = path.join(assetDirectory, 'objects', subHash);
            const assetPath = path.join(subAsset, hash);
            if (this.checkFiles && (
                !fs.existsSync(assetPath) ||
                (this.checkHash && !await checkFileHash(assetPath, hash))
            )) {
                (number <= 0) && logger.debug(`Downloading assets...`);
                this.downloadQueue.push({
                    type: 'assets',
                    size: size,
                    url: `${MC_RES_URL}/${subHash}/${hash}`,
                    filePath: assetPath,
                });
            }
            count++;
            this.checkFiles && emitProgress({
                task: count,
                total: Object.keys(index.objects).length,
            });
            return assetPath;
        };
        if (this.checkFiles && this.checkHash) {
            console.time("assets:sync_check");
            for (const number in Object.keys(index.objects)) {
                const asset = Object.keys(index.objects)[number];
                await assetProcessor(asset, number);
            }
            console.timeEnd("assets:sync_check");
        } else {
            console.time('assets:async_process');
            await Promise.all(Object.keys(index.objects).map((asset, number) => assetProcessor(asset, number)));
            console.timeEnd('assets:async_process');
        }
        emitProgress({
            task: Object.keys(index.objects).length,
            total: Object.keys(index.objects).length,
        });
        logger.debug('Collected assets!');
    }

    /**
     * Collect cp of libraries
     * @param {Object} classJson - version JSON
     */
    async getClasses(classJson) {
        const libraryDirectory = path.join(this.options.overrides.path.minecraft, 'libraries');
        const parsed = classJson.libraries
            .filter(lib => [lib.url, lib.artifact, lib.downloads?.artifact, lib.exact_url, lib.name].some(e => e != undefined))
            .filter(lib => !this.parseRule(lib))
            .filter(Boolean);
        let count = 0;
        const libs = (await Promise.all(parsed.map(async library => {

            const lib = library.name.split(':');
            const jarPath = path.join(libraryDirectory, `${lib[0].replace(/\./g, '/')}/${lib[1]}/${lib[2]}`);
            const name = `${lib[1]}-${lib[2]}${lib[3] ? '-' + lib[3] : ''}.jar`;
            const jarFile = path.join(jarPath, name);
            logger.debug(">>", "load", name);

            const hash = library.downloads?.artifact?.sha1 || library?.checksum || library?.artifact?.sha1 || undefined;
            const size = library.downloads?.artifact?.size || library?.size || library?.artifact?.size || 0;

            if (this.checkFiles && (
                !fs.existsSync(jarFile) ||
                (this.checkHash && hash != void 0 && !await checkFileHash(jarFile, hash))
            )) {
                logger.debug("<<", "download", name);
                const jar_name = `${lib[0].replace(/\./g, '/')}/${lib[1]}/${lib[2]}/${name}`;
                const urls = [
                    ...([library.downloads?.artifact?.url, library.artifact?.url, library.url, library.exact_url]),
                    ...([
                        'https://libraries.minecraft.net/',
                        'https://tlaun.ch/repo/libraries/',
                        'https://files.minecraftforge.net/maven/',
                        'https://dl.liteloader.com/versions/',
                        'https://repo1.maven.org/maven2/',
                        'https://maven.minecraftforge.net/',
                        'https://search.maven.org/remotecontent?filepath=',
                        (library.url || '')
                    ].map(e => e + jar_name))
                ].filter(Boolean);
                this.downloadQueue.push({
                    type: 'classes',
                    size: size,
                    url: urls,
                    filePath: jarFile,
                })
            }

            count++;
            this.checkFiles && this.emit('progress', {
                type: 'classes',
                task: count,
                total: parsed.length,
            });

            if (library.mod || library.downloadOnly) return false;

            return (`${jarPath}${path.sep}${name}`);
        }))).filter(Boolean);

        this.emit('progress', {
            type: 'classes',
            task: parsed.length,
            total: parsed.length,
        });

        logger.log(`Collected Class Path's! (count: ${libs.length})`);
        return libs;
    }

    /**
     * Parse rule for library
     * @param lib - Library to check
     * @returns {Boolean} - allow or disallow rule is
     */
    parseRule(lib) {
        if (lib.rules) {
            if (lib.rules.length > 1) {
                if (lib.rules[0].action === 'allow' &&
                    lib.rules[1].action === 'disallow' &&
                    lib.rules[1].os.name === 'osx') {
                    return this.getOS() === 'osx'
                } else {
                    return true
                }
            } else {
                if (lib.rules[0].action === 'allow' && lib.rules[0].os) return lib.rules[0].os.name !== this.getOS()
            }
        } else { return false }
    }

    /**
     * Returns memory arguments for JVM process.
     */
    getMemory() {
        if (!this.options.java.memory) {
            logger.debug('Memory not set! Setting 1GB as MAX!')
            this.options.java.memory = {
                min: 512,
                max: 1024
            }
        }
        if (!isNaN(this.options.java.memory.max) && !isNaN(this.options.java.memory.min)) {
            if (this.options.java.memory.max < this.options.java.memory.min) {
                logger.debug('MIN memory is higher then MAX! Resetting!')
                this.options.java.memory.max = 1024
                this.options.java.memory.min = 512
            }
            return [`${this.options.java.memory.max}M`, `${this.options.java.memory.min}M`]
        }
    }

    /**
     * Construct the argument array that will be passed to the JVM process.
     */
    constructJVMArguments(versionFile, tempNativePath, cp) {
        const assetRoot = path.resolve(path.join(this.options.overrides.path.minecraft, 'assets'))
        const assetPath = path.join(assetRoot)
        const jar = this.javaSeparator + this.options.mcPath;
        this.fields = {
            '${auth_access_token}': this.options.auth.access_token || this.options.auth.uuid,
            '${auth_session}': this.options.auth.access_token || this.options.auth.uuid,
            '${auth_player_name}': this.options.auth.username,
            '${auth_uuid}': this.options.auth.uuid,
            '${auth_xuid}': this.options.auth.uuid,
            '${user_properties}': JSON.stringify(this.options.auth.user_properties) || `{}`,
            '${user_type}': 'mojang',
            '${version_name}': this.overrides.version.name,
            '${assets_index_name}': versionFile.assetIndex.id,
            '${game_directory}': this.options.overrides.path.gameDirectory,
            '${assets_root}': assetPath,
            '${game_assets}': assetPath,
            '${version_type}': this.overrides.version.type,
            '${clientid}': this.options.auth.access_token,
            '${resolution_width}': this.overrides.resolution.width,
            '${resolution_height}': this.overrides.resolution.height,
            '${classpath}': `${cp.join(this.javaSeparator) + jar}`,
            '${natives_directory}': tempNativePath,
            '${game_libraries_directory}': this.options.overrides.path.versions,
            '${launcher_name}': 'TJMC',
            '${launcher_version}': '1.0.0'
        }
        let args = [];
        // Java Arguments
        if (this.overrides.javaArgs) {
            args.push(this.overrides.javaArgs);
        }
        if (process.platform === 'darwin') {
            args.push('-Xdock:name=TJMC-Launcher');
            args.push('-Xdock:icon=' + path.join(__dirname, 'assets', 'minecraft.icns'));
        }
        args.push('-Xmx' + this.getMemory()[0]);
        args.push('-Xms' + this.getMemory()[1]);
        args.push('-Dfile.encoding=UTF-8');
        args.push(...[
            '-Dminecraft.api.auth.host',
            '-Dminecraft.api.account.host',
            '-Dminecraft.api.session.host',
            '-Dminecraft.api.services.host'
        ].map(e => `${e}=${'https://0.0.0.0'}`));
        if (versionFile.arguments) {
            args = args.concat(this.getJVMArgs113(versionFile, tempNativePath, cp));
        } else {
            args = args.concat(this.getJVMArgs112(versionFile, tempNativePath, cp));
        }
        return args;
    }

    /**
     * Construct the argument array that will be passed to the JVM process.
     * This function is for 1.12 and below.
     */
    getJVMArgs112(versionFile, tempNativePath, cp) {

        let args = []
        args.push('-Djava.library.path=' + tempNativePath)

        // Classpath Argument
        const jar = (this.javaSeparator) + this.options.mcPath;
        args.push('-cp')
        args.push(`${cp.join(this.javaSeparator) + jar}`)

        // Main Java Class
        args.push(versionFile.mainClass)

        if (this.overrides.autoConnect) {
            args.push('--server=' + 'play.tjmc.ru');
        }

        // Forge Arguments
        args = args.concat(this.resolveArgs(versionFile))

        return args.filter(Boolean);
    }

    /**
     * Construct the argument array that will be passed to the JVM process.
     * This function is for 1.13+
     *
     * Note: Required Libs https://github.com/MinecraftForge/MinecraftForge/blob/af98088d04186452cb364280340124dfd4766a5c/src/fmllauncher/java/net/minecraftforge/fml/loading/LibraryFinder.java#L82
     *
     */
    getJVMArgs113(versionFile) {

        let args = []
        args = args.concat(versionFile.arguments.jvm)

        // Main Java Class
        args.push(versionFile.mainClass)

        if (this.overrides.autoConnect) {
            args.push('--server=' + 'play.tjmc.ru');
        }

        // Vanilla Arguments
        args = args.concat(versionFile.arguments.game)

        for (let i = 0; i < args.length; i++) {
            if (typeof args[i] === 'object' && args[i].rules != null) {
                let checksum = 0
                for (let rule of args[i].rules) {
                    if (rule.os != null) {
                        if (rule.os.name === this.getOS()
                            && (rule.os.version == null || new RegExp(rule.os.version).test(os.release))) {
                            if (rule.action === 'allow') {
                                checksum++
                            }
                        } else {
                            if (rule.action === 'disallow') {
                                checksum++
                            }
                        }
                    } else if (rule.features != null) {
                        // We don't have many 'features' in the index at the moment.
                        // This should be fine for a while.
                        if (rule.features.has_custom_resolution != null && rule.features.has_custom_resolution === true) {
                            if (this.overrides.resolution.fullscreen) {
                                args[i].value = [
                                    '--fullscreen',
                                    'true'
                                ]
                            }
                            checksum++
                        }
                    }
                }

                // TODO splice not push
                if (checksum === args[i].rules.length) {
                    if (typeof args[i].value === 'string') {
                        args[i] = args[i].value
                    } else if (typeof args[i].value === 'object') {
                        //args = args.concat(args[i].value)
                        args.splice(i, 1, ...args[i].value)
                    }
                    // Decrement i to reprocess the resolved value
                    i--
                } else {
                    args[i] = null
                }

            } else if (typeof args[i] === 'string' && !(args[i] === undefined)) {
                for (let ob of Object.keys(this.fields)) {
                    if (args[i].includes(ob)) {
                        args[i] = args[i].replace(ob, this.fields[ob])
                    }
                }
            } else if (typeof args[i] === 'object' && !args[i].rules) {
                if (typeof args[i].value === 'string') {
                    args[i] = args[i].value
                } else if (typeof args[i].value === 'object') {
                    //args = args.concat(args[i].value)
                    args.splice(i, 1, ...args[i].value)
                }
            } else {
                args[i] = null
            }
        }

        // Filter null values
        args = args.filter(arg => {
            return arg != null
        })

        return args.filter(Boolean);
    }

    /**
     * Resolve the arguments
     *
     * @returns {Array.<string>} An array containing the arguments
     */
    resolveArgs(versionFile) {

        const mcArgs = versionFile.minecraftArguments.split(' ')

        // Replace the declared variables with their proper values.
        for (let i = 0; i < mcArgs.length; i++) {
            if (Object.keys(this.fields).includes(mcArgs[i])) {
                mcArgs[i] = this.fields[mcArgs[i]]
            }
        }

        // Prepare game resolution
        if (this.overrides.resolution.fullscreen) {
            mcArgs.push('--fullscreen')
            mcArgs.push(true)
        } else {
            mcArgs.push('--width')
            mcArgs.push(this.overrides.resolution.width)
            mcArgs.push('--height')
            mcArgs.push(this.overrides.resolution.height)
        }

        return mcArgs
    }

    /**
     * Get current platform
     * @returns {'windows' | 'osx' | 'linux' | undefined}
     */
    getOS() {
        switch (process.platform) {
            case 'win32': return 'windows'
            case 'darwin': return 'osx'
            case 'linux': return 'linux'
            default: return undefined
        }
    }

}

module.exports = Minecraft
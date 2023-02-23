const fs = require('fs');
const path = require('path');
const { shallowEqual } = require('../util/Iterates');
const { debounce } = require('../util/Shedulers');
const LoggerUtil = require('../util/loggerutil');

const validateKeySet = (srcObj, destObj) => {
	if (srcObj == null) srcObj = {};
	const keys = Object.keys(srcObj);
	for (let i = 0; i < keys.length; i++) {
		if (typeof destObj[keys[i]] === 'undefined') {
			destObj[keys[i]] = srcObj[keys[i]];
		} else if (typeof srcObj[keys[i]] === 'object' && srcObj[keys[i]] != null && !(srcObj[keys[i]] instanceof Array)) {
			destObj[keys[i]] = validateKeySet(srcObj[keys[i]], destObj[keys[i]]);
		}
	}
	return destObj;
}

/**
 * Config Manager
 * @param {object} params
 * @param {string} params.prefix Prefix name (for debug)
 * @param {string} params.color Color of prefix name (for debug)
 * @param {string} params.configName Configuration filename
 * @param {string} params.configDir Configuration file directory
 * @param {object} params.defaultConfig Default configuration model
 */
const Config = function ({
	prefix = "ConfigManager",
	color = "#1052a5",
	configName,
	configDir = undefined,
	defaultConfig,
}) {

	const logger = LoggerUtil(`%c[${prefix}]`, `color: ${color}; font-weight: bold`);

	configName = configName || "config.json";
	let configPath = undefined;
	const DEFAULT_CONFIG = Object.seal(defaultConfig || {});
	var config = undefined;

	this.isLoaded = () => config != undefined;

	const callbacks = [void 0];
	let silentMode = false;

	this.addCallback = (callback = (config) => void 0) => {
		if (typeof callback === "function") callbacks.push(callback);
	};

	this.removeCallback = (callback = (config) => void 0) => {
		const index = callbacks.indexOf(callback);
		if (index !== -1) callbacks.splice(index, 1);
	};

	const runCallbacks = () => {
		callbacks.forEach((callback) => typeof callback === "function" ? callback({ ...config }) : null);
	};

	/**
	 * Read config from path
	 * @param {string} configPath path to config file
	 * @returns {object}
	 */
	const readConfig = (configPath) => {
		let forceSave = false;
		if (!fs.existsSync(configPath)) {
			logger.debug("[read]", 'Generating a new configuration file...');
			if (config == undefined) config = DEFAULT_CONFIG;
			forceSave = true;
		} else {
			try {
				config = fs.readFileSync(configPath, "utf-8");
				config = JSON.parse(config);
			} catch (err) {
				logger.warn('Configuration file contains malformed JSON or is corrupted!');
				config = DEFAULT_CONFIG;
				forceSave = true;
			}
		}
		return this.save(true, forceSave, "read -> save");
	}

	/**
	 * File watching callback
	 * @param {fs.WatchEventType} event file event
	 * @param {fs.PathLike} filename file name
	 */
	const watchCallback = (event, filename) => {
		if (filename == configName) {
			logger.log("[watch]", `${filename} file`, "->", event);
			readConfig(configPath);
			if (event == "change") {
				if (!silentMode) {
					runCallbacks();
				} else {
					logger.warn("[watch]", "> silent change");
				}
			}
		}
	}

	/**
	 * Load configuration and start watching
	 * @returns {object}
	*/
	this.load = (config_dir = undefined) => {
		config_dir = config_dir || configDir;
		configPath = path.join(config_dir, configName);
		readConfig(configPath);
		logger.debug("[load]", `${configName} file`, "->", (this.isLoaded() ? 'success' : 'failure'));
		if (this.isLoaded())
			fs.watch(configPath, debounce(watchCallback, 100, true, false));
		return config;
	}

	/**
	 * Save current config
	 * @param {boolean} silent should we use silent mode for skipping update
	 * @param {boolean} forceSave should we force saving without shallowing
	 * @param {string} reason reason for saving (only for debug purpose)
	 * @returns {object}
	 */
	this.save = (silent = false, forceSave = true, reason = "") => {
		silentMode = silent;
		if (!fs.existsSync(configPath)) fs.mkdirSync(path.join(configPath, '..'), { recursive: true });
		const validatedConfig = validateKeySet(DEFAULT_CONFIG, config);
		if (!shallowEqual(config, validatedConfig) || forceSave) { // prevent unnecessary writings
			config = validatedConfig;
			try {
				const content = JSON.stringify(config, null, 4);
				fs.writeFileSync(configPath, content, "utf-8");
			} catch (e) {
				logger.error("[save]", 'Config save error:', e)
			}
			logger.debug("[save]", "Config saved!", "\nSilent:", silent, "\nReason:", reason);
		}
		silentMode = false;
		return Boolean(config);
	}

	/**
	 * Set one property by key string
	 * @param {string} key key to set property
	 * @param {string|object} value value to set to key
	 * @returns {object}
	 */
	this.setOption = async (key, value) => {
		let valuePath = key.split('.');
		let lastKey = valuePath.pop();
		valuePath.reduce((o, k) => o[k] = o[k] || {}, config)[lastKey] = value;
		return this.save(false, true, "set option");
	}

	/**
	 * Get option from config
	 * @param {Function|String} selector selector must be a picker function or just a key string
	 * @param {boolean} _default return default config value
	 * @returns {string|number|object}
	 */
	this.getOption = (selector = void 0, _default = false) => {
		let state = Object.assign({}, _default ? DEFAULT_CONFIG : config);
		if (typeof selector === "function") {
			try {
				state = selector(state);
			} catch (e) { } // тут похуй + поебать
		} else if (typeof selector === "string") {
			let valuePath = selector.split('.');
			state = valuePath.reduce((o, k) => o[k] = o[k] || {}, state);
		}
		return state;
	}

}

module.exports = Config;
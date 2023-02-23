const fs = require('fs');
const path = require('path');
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

const Config = function ({
	prefix = "ConfigManager",
	color = "#1052a5",
	configName = "config.json",
	configDir = "",
	defaultConfig = {},
}) {

	const logger = LoggerUtil(`%c[${prefix}]`, `color: ${color}; font-weight: bold`);

	configName |= "config.json";
	const configPath = path.join(configDir, configName);
	logger.debug("Config Path:", configPath);

	const DEFAULT_CONFIG = Object.seal(defaultConfig);

	var config = undefined;
	const callbacks = [void 0];
	let silentMode = false;

	this.isLoaded = () => config != undefined;

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

	const watchCallback = (event, filename) => {
		if (filename == configName) {
			logger.log("[watch]", `${filename} file`, "->", event);
			config = readConfig(configPath);
			if (event == "change") {
				if (!silentMode) {
					runCallbacks();
				} else {
					logger.warn("[watch]", "> silent change");
				}
			}
		}
	}
	const watchDebounce = debounce(watchCallback, 100, true, false);

	this.load = () => {
		config = readConfig(configPath);
		logger.debug("[load]", `${configName} file`, "->", (this.isLoaded() ? 'success' : 'failure'));
		if (this.isLoaded()) fs.watch(configPath, watchDebounce);
		return config;
	}

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
		return config;
	}

	this.setOption = async (key, value) => {
		let valuePath = key.split('.');
		let lastKey = valuePath.pop();
		valuePath.reduce((o, k) => o[k] = o[k] || {}, config)[lastKey] = value;
		return this.save(false, true, "set option");
	}

	this.getOption = (selector = void 0) => {
		let state = Object.assign({}, config);
		if (typeof selector === "function") {
			try {
				state = selector({ ...config });
			} catch (e) { } // тут похуй + поебать
		} else if (typeof selector === "string") {
			let valuePath = selector.split('.');
			state = valuePath.reduce((o, k) => o[k] = o[k] || {}, config);
		}
		return state;
	}

}

exports = Config;
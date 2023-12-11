
const { spawn } = require('child_process');
const LoggerUtil = require("../util/loggerutil");
const { generateIdFor } = require("../util/Random");
const logger = LoggerUtil('%c[InstanceManager]', 'color: #f6fe10; font-weight: bold');

/**
 * Keys deleted before goes to renderer
 */
const lessKeys = ['hash', 'javaPath', 'javaArgs', 'stdout', 'stderr'];

/**
 * Instances map
 */
const instances = new Map();

/**
 *
 * @param {string} hash
 * @param {import('fs').PathLike} javaPath
 * @param {string} javaArgs
 * @param {object} options
 * @returns
 */
exports.createInstance = function (hash, javaPath, javaArgs, options = {}) {
	// logger.debug(`Launching ${hash} with arguments ${javaPath} ${javaArgs.join(' ')}`);

	const id = generateIdFor(instances);

	const controller = new AbortController();
	const currentProcess = spawn(
		javaPath, javaArgs,
		{
			encoding: 'utf8',
			cwd: options.cwd || process.cwd,
			detached: options.detached,
			signal: controller.signal,
		}
	);

	if (instances.get(id)) return;

	const instance = Object.seal({
		process: currentProcess,
		controller: controller,
		hash: hash,
		javaPath: javaPath,
		javaArgs: javaArgs,
		stdout: [],
		stderr: [],
	});
	instances.set(id, instance);
	runCallbacks('create');

	if (!options.disableLogging) {
		currentProcess.stdout.on('data', (data) => {
			instance.stdout.push(data.toString('utf-8'));
			logger.log(`{${hash}}`, data.toString('utf-8'));
			runCallbacks('stdout');
		});

		currentProcess.stderr.on('data', (data) => {
			instance.stderr.push(data.toString('utf-8'));
			logger.error(`{${hash}}`, data.toString('utf-8'));
			runCallbacks('stderr');
		});

		currentProcess.on('close', (code) => {
			logger.warn(`{${hash}}`, "ExitCode:", code);
			instances.delete(id);
			runCallbacks('close');
		});
	}

	currentProcess.on('spawn', () => runCallbacks('spawn'));

	return currentProcess;
}

exports.getInstances = (less = false) => {
	if (less) {
		return Object.fromEntries(Object.entries(Object.fromEntries(instances)).map(([k, v]) =>
			[k, Object.fromEntries(Object.entries(v).filter(([k, v]) => lessKeys.includes(k)))]
		));
	}
	return ([...instances] || []).map(([k, v]) => v);
}
exports.getInstanceById = (instanceId) => {
	return instances.get(instanceId) || undefined;
}
exports.getInstanceByHash = (hash) => {
	return ([...instances].filter(([key, value]) => value.hash == hash) || []).map(([k, v]) => v);
}

exports.killInstance = async (instanceId) => {
	const instance = instances.get(instanceId);
	console.debug(">>kill", instance.hash);
	return instance.process.kill();
}

exports.killAllInstances = async () => {
	return instances.forEach((value, instanceId) => this.killInstance(instanceId));
};


const callbacks = [void 0];

this.addCallback = (callback = (instances, event = null) => void 0) => {
	if (typeof callback === "function") callbacks.push(callback);
};

this.removeCallback = (callback = (instances, event = null) => void 0) => {
	const index = callbacks.indexOf(callback);
	if (index !== -1) callbacks.splice(index, 1);
};

const runCallbacks = (event = null) => {
	const filteredInstances = Object.fromEntries(Object.entries(Object.fromEntries(instances)).map(([k, v]) =>
		[k, Object.fromEntries(Object.entries(v).filter(([k, v]) => lessKeys.includes(k)))]
	));
	callbacks.forEach((callback) => typeof callback === "function" ? callback(filteredInstances, event) : null);
};
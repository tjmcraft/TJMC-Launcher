
const { generateIdFor } = require("../util/Random");
const LoggerUtil = require("../util/loggerutil");
const child = require('child_process')
const logger = LoggerUtil('%c[InstanceManager]', 'color: #f6fe10; font-weight: bold');


const instances = new Map();

function createInstance(hash, javaPath, javaArgs, options = {}) {
	logger.debug(`Launching ${hash} with arguments ${javaPath} ${javaArgs.join(' ')}`);

	const id = generateIdFor(instances);
	const process = child.spawn(
		javaPath, javaArgs,
		{
			encoding: 'utf8',
			cwd: options.cwd || process.cwd,
			detached: options.detached,
		}
	);

	instances.set(id, process);

	if (!options.disableLogging) {
		process.stdout.on('data', (data) => {
			logger.log(`{${hash}}`, data.toString('utf-8'));
		});

		process.stderr.on('data', (data) => {
			logger.error(`{${hash}}`, data.toString('utf-8'));
		});

		process.on('close', (code) => {
			logger.warn(`{${hash}}` + code);
		});
	}

	return id;
}

function getInstanceById(id) { }

function getInstanceByHash(hash) { }



exports.createInstance = createInstance;
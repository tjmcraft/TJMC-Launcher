const { parentPort, isMainThread } = require("node:worker_threads");
const JavaManager = require("../managers/JavaManager");
const logger = require("../util/loggerutil")('%c[JavaWorker]', 'color: #feb600; font-weight: bold');

const instances = new Map();

if (!isMainThread) {
	parentPort.on('message', async ({ type, payload }) => {
		if (type == 'start') {
			const { label, rootDir, externalJava, recommendedJava } = payload;
			if (instances.get(label)) return;
			const controller = new AbortController();
			instances.set(label, {
				controller
			});

			controller.signal.addEventListener('abort', () => {
				logger.debug("Aborted!");
			})

			const instance = new JavaManager(rootDir);
			instance.on('download-progress', (e) => {
				const progress = (e.current / e.total);
				parentPort.postMessage({
					type: 'download-progress',
					payload: progress,
				})
			});

			const checkJava = async (javaPath, type = 'external') => {
				if (!["", undefined].includes(javaPath)) {
					const java = await instance.checkJava(javaPath);
					if (!java.run) {
						logger.error(`Wrong ${type} java (${javaPath}) => ${java.message}`);
					} else {
						logger.debug(`Using Java (${javaPath}) version ${java.version} ${java.arch}`);
						return javaPath;
					}
				}
				return undefined;
			};

			const checkExternal = async () => checkJava(externalJava, 'external');
			const checkRecommended = async () => {
				const java = instance.getRecommendedJava({ javaVersion: recommendedJava });
				parentPort.postMessage({
					type: 'download-progress',
					payload: 0.5,
				})
				let javaPath = await instance.downloadJava(java.component, controller.signal);
				return await checkJava(javaPath, 'recommended');
			}
			const checkInternal = async () => checkJava('java', 'internal');

			for (const task of [checkExternal, checkRecommended, checkInternal]) {
				if (controller.signal.aborted) break;
				const java = await task();
				if (java != void 0) {
					instances.delete(label);
					return parentPort.postMessage({ type: 'javaPath', payload: java });
				}
			}
			instances.delete(label);
			return parentPort.postMessage({ type: 'error', payload: "No java found!" });
		}
	});
	parentPort.on('message', async ({type, payload}) => {
		if (type == 'abort') {
			const { label } = payload;
			if (!instances.get(label)) return;
			const { controller } = instances.get(label);
			controller.abort();
			instances.delete(label);
		}
	});
}
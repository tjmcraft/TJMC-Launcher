const { parentPort, workerData, isMainThread } = require("node:worker_threads");
const JavaManager = require("../managers/JavaManager");

if (!isMainThread) {
	if (!workerData) return;
	const { rootDir, externalJava, recommendedJava } = workerData;
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
				this.debug && logger.error(`Wrong ${type} java (${javaPath}) => ${java.message}`);
				// javaPath = undefined;
			} else {
				return javaPath;
			}
		}
		return undefined;
	};

	const checkExternal = async () => checkJava(externalJava, 'external');
	const checkRecommended = async () => {
		const java = instance.getRecommendedJava({ javaVersion: recommendedJava });
		let javaPath = await instance.downloadJava(java.component);
		return await checkJava(javaPath, 'recommended');
	}
	const checkInternal = async () => checkJava('java', 'internal');

	(async () => {
		for (const task of [checkExternal, checkRecommended, checkInternal]) {
			const java = await task();
			if (java != void 0) return parentPort.postMessage({ type: 'javaPath', payload: java });
		}
		return parentPort.postMessage({ type: 'error', payload: "No java found!" });
	})();

}
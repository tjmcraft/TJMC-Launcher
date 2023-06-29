import { createElement, memo } from "react";

import buildClassName from "Util/buildClassName";
import useGlobal from "Hooks/useGlobal";
import { selectCurrentVersionHash, selectInstallation } from "Model/Selectors/installations";

import CubeTopContainer from "./CubeTopContainer";
import CubeMainContainer from "./CubeMainContainer";


const CubeContent = () => {

	const { hash, hasInstallations } = useGlobal(global => {
		const versionHash = selectCurrentVersionHash(global);
		const version = selectInstallation(global, versionHash) || undefined;
		return {
			hash: versionHash,
			hasInstallations: version !== undefined,
		};
	});

	return (
		hasInstallations ? (
			<div className={buildClassName("main-content", "auto-s")}>
				<CubeTopContainer hash={hash} />
				<CubeMainContainer hash={hash} />
			</div>
		) : (
			<div className={buildClassName("main-content", "d-flex", "centred")}>
				<h1>{"Выберите версию"}</h1>
			</div>
		)
	);
};

export default memo(CubeContent);
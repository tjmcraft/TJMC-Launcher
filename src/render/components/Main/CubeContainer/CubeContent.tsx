import { createElement, memo } from "react";

import buildClassName from "Util/buildClassName";
import useGlobal from "Hooks/useGlobal";
import { selectInstallation } from "Model/Selectors/installations";

import CubeTopContainer from "./CubeTopContainer";
import CubeMainContainer from "./CubeMainContainer";


const CubeContent = ({ hash }) => {

	const { hasInstallation } = useGlobal(global => {
		const version = selectInstallation(global, hash) || undefined;
		return {
			hasInstallation: version !== undefined,
		};
	}, [hash]);

	return (
		hasInstallation ? (
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
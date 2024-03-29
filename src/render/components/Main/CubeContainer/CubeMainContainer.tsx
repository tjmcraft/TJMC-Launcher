import React, { memo, createElement } from "react";
import useGlobal from "Hooks/useGlobal";
import { selectInstallation } from "Model/Selectors/installations";

const Test = ({ hash }: { hash: string }) => {
	const { name } = useGlobal(global => {
		const version = selectInstallation(global, hash);
		return { name: version.name };
	}, [hash]);
	return (<h1>{name} - {hash}</h1>);
};

const CubeMainContainer = ({ hash }: { hash: string }) => {
	if (APP_ENV == "production") return null;
	return (
		<div className="main">
			<Test hash={hash} />
		</div>
	);
};

export default memo(CubeMainContainer);
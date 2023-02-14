import { memo, createElement } from "react";
import useGlobal from "Hooks/useGlobal";
import { selectInstallation } from "Model/Selectors/installations";

const Test = memo(({ hash }) => {
	const { name } = useGlobal(global => {
		const version = selectInstallation(global, hash);
		return { name: version.name };
	}, [hash]);
	return (<h1>{name} - {hash}</h1>);
});

const CubeMainContainer = memo(({ hash }) => {
	if (APP_ENV == "production") return null;
	return (
		<div class="main">
			<Test hash={hash} />
		</div>
	);
});

export default CubeMainContainer;
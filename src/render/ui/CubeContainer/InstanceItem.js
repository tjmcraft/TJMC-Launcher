import { createElement, useCallback, useRef, memo, useEffect } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Util/Store";

import useGlobal from "Hooks/useGlobal";
import { selectInstallation, selectInstance } from "Model/Selectors/installations";

const InstanceItem = ({ instanceId }) => {
	const { hash, name } = useGlobal(global => {
		const instance = selectInstance(global, instanceId);
		const version = selectInstallation(global, instance.hash);
		return {
			name: version.name,
			hash: instance.hash,
		};
	}, [instanceId]);
	return instanceId && (
		<div className={buildClassName('item', 'navItem')}>
			<span>{name || hash || instanceId}</span>
		</div>
	);
};

export default memo(InstanceItem);
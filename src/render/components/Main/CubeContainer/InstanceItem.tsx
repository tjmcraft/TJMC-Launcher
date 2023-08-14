import { createElement, useCallback, memo, FC } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Store/Global";

import useGlobal from "Hooks/useGlobal";
import { selectInstallation, selectInstance } from "Model/Selectors/installations";

const InstanceItem: FC<{
	instanceId: string;
}> = ({ instanceId }) => {
	const { openCubeLogs, closeCubeLogs, killInstance } = getDispatch();
	const { hash, name } = useGlobal(global => {
		const instance = selectInstance(global, instanceId);
		const version = selectInstallation(global, instance.hash);
		return {
			name: version.name,
			hash: instance.hash,
		};
	}, [instanceId]);
	const handleClick = useCallback(() => openCubeLogs(instanceId), [openCubeLogs, instanceId]);
	const handleKill = useCallback(() => killInstance(instanceId), [killInstance, instanceId]);
	return instanceId && (
		<div className={buildClassName('item', 'navItem')} onClick={handleClick}>
			<span>{name || hash || instanceId}</span>
			<button className="circle" onClick={handleKill} title="Kill instance"><i className="icon-close"></i></button>
		</div>
	);
};

export default memo(InstanceItem);
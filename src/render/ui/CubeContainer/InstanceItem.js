import { createElement, useCallback, memo } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Store/Global";

import useGlobal from "Hooks/useGlobal";
import { selectInstallation, selectInstance } from "Model/Selectors/installations";
import { SVG } from "UI/svg";

const InstanceItem = ({ instanceId }) => {
	const { killInstance } = getDispatch();
	const { hash, name } = useGlobal(global => {
		const instance = selectInstance(global, instanceId);
		const version = selectInstallation(global, instance.hash);
		return {
			name: version.name,
			hash: instance.hash,
		};
	}, [instanceId]);
	const handleKill = useCallback(() => killInstance(instanceId), [killInstance, instanceId]);
	return instanceId && (
		<div className={buildClassName('item', 'navItem', 'noAction')}>
			<span>{name || hash || instanceId}</span>
			<div className={buildClassName("button", "small")} title="Kill instance" onClick={handleKill}>{SVG('cross')}</div>
		</div>
	);
};

export default memo(InstanceItem);
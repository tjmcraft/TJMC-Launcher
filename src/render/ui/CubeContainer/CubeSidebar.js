import { memo, createElement, Fragment } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Util/Store";
import useGlobal from "Hooks/useGlobal";
import { selectCurrentVersionHash, selectInstallations, selectInstances } from "Model/Selectors/installations";

import { SVG } from "UI/svg";
import CubeSidebarItem from "./CubeSidebarItem";
import InstanceItem from "./InstanceItem";


const CubeSidebarItems = memo(() => {

	const installations = useGlobal(global => Object.keys(selectInstallations(global)));
	const currentHash = useGlobal(selectCurrentVersionHash);

	if (!installations.length) return (
		<div className={buildClassName('item', "d-flex", "centred", 'fp')}>
			<h1>{'Добавьте версию'}</h1>
		</div>
	);

	return (
		installations.map((hash) =>
			createElement(CubeSidebarItem, {
				key: hash,
				hash,
				isSelected: currentHash == hash,
			}))
	);
});

const InstanceItems = memo(() => {

	const instances = useGlobal(global => Object.keys(selectInstances(global)));

	if (!instances.length) return (
		<div className={buildClassName('item', "d-flex", "centred", 'fp')}>
			<h1>{'Launch new instance'}</h1>
		</div>
	);

	return instances.map((instanceId) =>
		<InstanceItem
			key={instanceId}
			instanceId={instanceId}
		/>
	);
});

const CubeSidebar = () => {

	const { openVersionChooserModal } = getDispatch();
	const onClick = () => openVersionChooserModal();

	return (
		<Fragment>
			<div className={buildClassName('scroller', 'thin-s')}>
				<h2 className={buildClassName('header-w', 'container-df')}>
					<span>{"Версии"}</span>
					<div className={'simple-button'} onClick={onClick}>{SVG('add-plus')}</div>
				</h2>
				<CubeSidebarItems />
			</div>
			<div className={buildClassName('scroller', 'thin-s')}>
				<h2 className={buildClassName('header-w', 'container-df')}>
					<span>{"Instances"}</span>
				</h2>
				<InstanceItems />
			</div>
		</Fragment>
	);
};

export default memo(CubeSidebar);
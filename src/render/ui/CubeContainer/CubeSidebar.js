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
	return installations.length ? (
		installations.map((hash) =>
			createElement(CubeSidebarItem, {
				key: hash,
				hash,
				isSelected: currentHash == hash,
			}))
	) : (
		<div className={buildClassName('item', "d-flex", "centred", 'fp')}>
			<h1>{'Добавьте версию'}</h1>
		</div>
	);
});

const InstallationsScroller = memo(() => {
	const { openVersionChooserModal } = getDispatch();
	const onClick = () => openVersionChooserModal();
	return (
		<div className={buildClassName('scroller', 'thin-s')}>
			<h2 className={buildClassName('header-w', 'container-df')}>
				<span>{"Версии"}</span>
				<div className={'simple-button'} onClick={onClick}>{SVG('add-plus')}</div>
			</h2>
			<CubeSidebarItems />
		</div>
	);
});

const InstanceScroller = memo(() => {
	const instances = useGlobal(global => Object.keys(selectInstances(global)));
	return instances.length > 0 && (
		<div className={buildClassName('scroller', 'thin-s')}>
			<h2 className={buildClassName('header-w', 'container-df')}>
				<span>{"Instances"}</span>
			</h2>
			{instances.map((instanceId) =>
				<InstanceItem
					key={instanceId}
					instanceId={instanceId}
				/>
			)}
		</div>
	);
});

const CubeSidebar = () => {
	return (
		<Fragment>
			<InstallationsScroller />
			<InstanceScroller />
		</Fragment>
	);
};

export default memo(CubeSidebar);
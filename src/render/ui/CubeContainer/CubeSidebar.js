import { memo, createElement } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Util/Store";
import useGlobal from "Hooks/useGlobal";
import { selectCurrentVersionHash, selectInstallations } from "Model/Selectors/installations";

import { SVG } from "UI/svg";
import CubeSidebarItem from "./CubeSidebarItem";


const CubeSidebarItems = memo(() => {

	const installations = useGlobal(global => Object.keys(selectInstallations(global)));
	const currentHash = useGlobal(selectCurrentVersionHash);

	if (!installations.length) return (
		createElement('div', { class: buildClassName('item', "d-flex", "centred", 'fp') },
			createElement('h1', {}, 'Добавьте версию'))
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

const CubeSidebar = memo(() => {

	const { openVersionChooserModal } = getDispatch();
	const onClick = () => openVersionChooserModal();

	return (
		createElement('div', { class: buildClassName('scroller', 'thin-s') },
			createElement('h2', { class: buildClassName('header-w', 'container-df') },
				createElement('span', null, 'Версии'),
				createElement('div', { class: 'simple-button', onClick }, SVG('add-plus')),),
			createElement(CubeSidebarItems))
	);
});

export default CubeSidebar;
import { randomString } from "Util/Random";

export function addModal(global, payload) {
	const modals = [...global.modals];
	const params = Object.assign({}, {
		layer: undefined,
		label: randomString(5),
	}, payload);
	if (params.layer == undefined) return;
	if (modals.filter(modal => modal.label == params.label).length <= 0) {
		if (modals.length > 0) { // hide latest if exists
			const parent = modals[modals.length - 1];
			parent.isShown = false;
		}
		modals.push({
			layer: params.layer,
			label: params.label,
			isShown: true,
			isClosing: false,
			props: params,
		});
	}
	return {
		...global,
		modals
	};
}

export function closeModal(global, payload = undefined) {
	const modals = [...global.modals];
	const last = modals[modals.length - 1];
	if (last && last.isShown) {
		last.isShown = false;
		last.isClosing = true;
	}
	const prev = modals[modals.length - 2];
	if (prev && !prev.isShown) prev.isShown = true;
	return {
		...global,
		modals
	};
}

export function unloadModal(global, payload = undefined) {
	const modals = [...global.modals];
	const current = modals.slice().reverse().find(modal => modal.isClosing && !modal.isShown);
	if (current) modals.splice(modals.indexOf(current), 1);
	return {
		...global,
		modals
	};
}
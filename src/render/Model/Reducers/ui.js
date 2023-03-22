import { randomString } from "Util/Random";
import { getState, setState } from "Store/Global";

export function addModal(payload) {
	const global = getState();
	const modals = [...global.modals];
	if (payload.layer == undefined) return;
	payload.label = payload.label != void 0 ? payload.label : `${payload.layer}-${randomString(5)}`;
	if (modals.filter(modal => modal.label == payload.label).length <= 0) {
		if (modals.length > 0) { // hide latest if exists
			const parent = modals[modals.length - 1];
			parent.isShown = false;
		}
		modals.push({
			layer: payload.layer,
			label: payload.label,
			isShown: true,
			isClosing: false,
			props: payload,
		});
	}
	setState({
		...global,
		modals
	});
}

export function closeModal(payload = undefined) {
	const global = getState();
	const modals = [...global.modals];
	const last = modals[modals.length - 1];
	if (last && last.isShown) {
		last.isShown = false;
		last.isClosing = true;
	}
	const prev = modals[modals.length - 2];
	if (prev && !prev.isShown) prev.isShown = true;
	setState({
		...global,
		modals
	});
}

export function unloadModal(payload = undefined) {
	const global = getState();
	const modals = [...global.modals];
	const current = modals.slice().reverse().find(modal => modal.isClosing && !modal.isShown);
	if (current) modals.splice(modals.indexOf(current), 1);
	setState({
		...global,
		modals
	});
}
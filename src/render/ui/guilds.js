import { createElement } from "react";
import buildClassName from "Util/buildClassName";
import { randomString } from "Util/Random";

export const Guilds = ({children}) => {
	return createElement('nav', { class: 'guilds' },
		createElement('ul', { class: 'tree' },
			createElement('div', {
				class: buildClassName('scroller', 'no-scrollbar'),
			}, children)));
};

export const Guild = ({id, type, onClick, image = null, svg = null, selected = false}) => {
	id = id || randomString(3);
	const onclick = (e) => {
		// console.debug("sel", id)
		if (typeof onClick === 'function') onClick.call(this, e);
	};
	return createElement('div', {
		class: buildClassName('listItem', selected && "selected"),
		'data-id': id,
	},
	type == 'separator' ?
		createElement('div', { class: 'guildSeparator' }) :
		createElement('div', { class: 'wrapper', onclick },
			image ?
				createElement('img', { src: image }) :
				createElement('div', { class: 'singleIconBtn' }, svg || id)));
};
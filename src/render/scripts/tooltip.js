import { PopupEl } from '../ui/popup-element.js';
export function tooltip(text = null) {
	text = text || this.dataset.tooltip || this.title;
	if (!text) return;
	let parent = this,
		popup = new PopupEl({
			parent: parent,
			margin: 8,
			fadeTime: 100
		}, text);
	//popup.appendHTML(text)
	parent.addEventListener('mouseenter', show);
	parent.addEventListener('mouseleave', hide);

	function show(e) {
		popup.show();
	}

	function hide(e) {
		popup.hide(() => popup.destroy());
	}

	function destroy() {
		hide();
		parent.removeEventListener('mouseenter', show);
		parent.removeEventListener('mouseleave', destroy);
	}
}
Element.prototype.tooltip = tooltip;
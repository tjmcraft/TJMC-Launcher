import { Component, createElement } from "Libs/GreenTree/GreenTree";
import { getPos } from "Libs/ElementEx";
import { randomString } from "Util/Random";

export class PopupEl {
	constructor(options = {}, text) {
		this.options = options;
		this.options.parent = this.options.parent || document.body;
		this.options.text = text || "PopupEl!";
		this.options.layerContainer = options.layerContainer || document.querySelector('.layerContainer');
	}

	render(callback = () => {}) {
		if (!this.options.layerContainer) return;
		this.popup = createElement('div', {
			class: 'tooltip'
		});
		this.pointerEl = createElement('div', {
			class: 'pointer'
		});
		this.contentEl = createElement('div', {
			class: 'content'
		}, this.options.text);
		this.popup.id = this.options.id || `popup-${randomString(5)}`;
		this.popup.append(this.pointerEl, this.contentEl);
	}

	join(callback = () => { }) {
		if (this.options.layerContainer.querySelector(`#${this.popup?.id}`)) return;
		this.render();
		this.popup.style.opacity = 0;
		this.popup.style.visibility = 'hidden';

		this.options.layerContainer.append(this.popup);
		callback();
	}

	show(callback = () => { }) {
		//let fadeTime = this.options.fadeTime || 150
		this.join();
		this.setPopupPos(this.popup, this.options.margin || 10);
		this.popup.style.visibility = 'visible';
		this.popup.style.opacity = 1;
		callback();
		//this.popup.fadeIn(fadeTime, callback)
	}

	hide(callback = () => {}) {
		//let fadeTime = this.options.fadeTime || 150
		this.popup.style.opacity = 0;
		this.popup.style.visibility = 'hidden';
		callback();
		//this.popup.fadeOut(fadeTime, callback)
	}

	destroy(callback = () => {}) {
		this.hide(() => {
			this.popup.remove();
			callback();
		});
	}

	getPopupPos(el, m = 5) {
		let offset = getPos( this.options.parent ),
			pos = '',
			x_o = ( (this.options.parent.offsetWidth - el.offsetWidth) / 2 ) + offset.left,
			x = (x_o > 0) ? x_o : 0,
			y_t = ( offset.top - m - el.offsetHeight ),
			y_b = ( offset.top + this.options.parent.offsetHeight + m ),
			y = (y_t - 25 > 0) && (pos = 'top') ? y_t :
				(y_b) && (pos = 'bottom') ? y_b : 0,
			width = (this.options.parent.offsetWidth - m*2);
		return { left: x, top: y, width, height: 'auto', position: pos };
	}

	setPopupPos(el, m = 5) {
		let bounds = this.getPopupPos(el, m);
		el.style.position = 'absolute';
		el.style.top = `${bounds.top  }px`;
		el.style.left = `${bounds.left  }px`;
		this.popup.setAttribute('position', bounds.position);
		//el.style.width = bounds.width + 'px'
	}

	/**
     * Append dom content to created popup
     * @param {*} content
     */
	append(content) {
		this.contentEl.append(content);
	}
	/**
     * Append HTML (text) content to created popup
     * @param {String} content
     */
	appendHTML(content) {
		this.contentEl.innerHTML = (content);
	}
	/**
     * Remove child from created popup
     * @param {*} content
     */
	removeChild(content) {
		this.contentEl.removeChild(content);
	}

	get content() {
		return this.popup;
	}

	update(content) {
		if (this.contentEl) this.contentEl.innerHTML = (content);
		else this.options.text = (content);
		this.show();
	}
}

class PopupElement extends Component {
	constructor(props) {
		super(props);
		this.props.popupLayer = this.props.popupLayer || document.querySelector('.layerContainer');
		this.props.parent = this.props.parent || document.body;
		delete this.props.popupLayer;
		delete this.props.parent;
		this.state.open = false;
		this.style.opened = { opacity: 1, visibility: 'visible' };
		this.style.hidden = { opacity: 0, visibility: 'hidden' };
	}
	render() {
		return createElement('div',
			Object.assign({
				class: 'tooltip',
				id: `popup-${randomString(6)}`,
				style: this.state.open ? this.style.opened : this.style.hidden,
			}, this.props),
			createElement('div', { class: 'pointer' }),
			createElement('div', { class: 'content' }));
	}
}
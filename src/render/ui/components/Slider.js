import { Component, createElement, createRef } from "react";
import { getPos } from "Libs/ElementEx.js";
import { PopupEl } from "../popup-element.js";
import style from "CSS/slider.module.css";
import { randomString } from "Util/Random.js";

export default class RangeSlider extends Component {

	constructor(props) {
		super(props);
		props.id = props.id || randomString(5);
		props.value = props.value || 0;
		props.min = props.min || 0;
		props.max = props.max || 100;
		props.step = props.step || 1;
		this.state = {
			value: props.value,
			notch: ((props.value - this.meta.min) / this.meta.step) * this.meta.inc,
		};
		this.track = createRef();
		this.grabber = createRef();
	}

	get meta() {
		const val = {
			max: Number(this.props.max),
			min: Number(this.props.min),
			step: Number(this.props.step),
		};
		val.ticks = (val.max - val.min) / val.step;
		val.inc = 100 / val.ticks;
		return val;
	}


	handleMousedown = (e) => {
		document.addEventListener("mouseup", this.handleMouseup);
		document.addEventListener("mousemove", this.handleMousemove);
		this.grabber.current.onmouseenter = null;
		this.grabber.current.onmouseout = null;
		this.handleMousemove(e);
	};

	handleMousemove = (e) => {
		const pos = getPos(this.track.current);
		const diff = e.pageX - pos.left;
		const perc = Math.max(Math.min(Number((diff / this.track.current.offsetWidth) * 100).toFixed(1), 100), 0);
		const notch = Math.max(Math.min(Number(perc / this.meta.inc).toFixed(0) * this.meta.inc, 100), 0);
		// console.debug("[RangeSlider]", "move", diff, perc);
		if (Math.abs(perc - notch) < this.meta.inc / 2) {
			const value = Math.round((this.meta.min + (this.meta.step * (notch / this.meta.inc))) * 100) / 100;
			const event = new MouseEvent("change", {
				target: this.track.current,
				type: "change",
				bubbles: false,
				cancelable: true
			});
			let cancelled = !this.track.current.dispatchEvent(event);
			if (!cancelled) {
				this.setState({ notch, value }, () => {
					this.popup.update(value + this.props.unit);
				});
			}
		}
	};

	handleMouseup = (e) => {
		document.removeEventListener("mouseup", this.handleMouseup);
		document.removeEventListener("mousemove", this.handleMousemove);
		this.grabber.current.onmouseenter = this.showPopup.bind(this);
		this.grabber.current.onmouseout = this.hidePopup.bind(this);
		this.hidePopup();
		if (typeof this.props.onChange === "function") {
			this.props.onChange.call(this, this.state.value);
		}
	};

	render(props, state) {
		return (
			createElement("div", {
				class: style.slider,
				id: props.id,
				value: state.value,
				min: props.min,
				max: props.max,
				step: props.step,
			},
			createElement("div", { class: style.bar, style: `width:${state.notch}%` }),
			createElement("div", { class: style.track, onMouseDown: this.handleMousedown, ref: this.track },
				createElement("div", { class: style.grabber, ref: this.grabber, style: `left:${state.notch}%` })))
		);
	}

	showPopup() {
		this.popup.show();
	}
	hidePopup() {
		this.popup.hide();
	}

	componentDidMount() {
		// console.debug("> slider mount");
		this.popup = new PopupEl({
			parent: this.grabber.current,
			margin: 8,
			fadeTime: 50
		});
		this.grabber.current.onmouseenter = this.showPopup.bind(this);
		this.grabber.current.onmouseout = this.hidePopup.bind(this);
		this.popup.update(this.state.value + this.props.unit);
		this.popup.hide();
	}

	componentWillUnmount() {
		this.popup.destroy();
	}

}
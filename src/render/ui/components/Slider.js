import { Component, createElement, createRef } from "react";
import { getPos } from "Libs/ElementEx.js";
import style from "CSS/slider.module.css";
import { randomString } from "Util/Random.js";
import { toFixedNumber } from "Util/Numbers.js";
import Tooltip from "./Tooltip.js";

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
			popupOpen: false,
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
		this.handleMousemove(e);
	};

	handleMousemove = (e) => {
		const pos = getPos(this.track.current);
		const diff = e.pageX - pos.left;
		const percent = Math.max(Math.min(toFixedNumber((diff / this.track.current.offsetWidth) * 100, 1), 100), 0);
		const notch = Math.max(Math.min(toFixedNumber(percent / this.meta.inc, 0) * this.meta.inc, 100), 0);
		if (Math.abs(percent - notch) < this.meta.inc / 2) {
			const value = Math.round((this.meta.min + (this.meta.step * (notch / this.meta.inc))) * 100) / 100;
			const event = new MouseEvent("change", {
				bubbles: false,
				cancelable: true
			});
			let cancelled = !this.track.current.dispatchEvent(event);
			if (!cancelled) {
				this.setState({ notch, value });
			}
		}
	};

	handleMouseup = () => {
		document.removeEventListener("mouseup", this.handleMouseup);
		document.removeEventListener("mousemove", this.handleMousemove);
		if (typeof this.props.onChange === "function") {
			this.props.onChange.call(this, this.state.value);
		}
	};

	render(props, state) {
		return (
			<div className={style.slider} id={props.id}>
				<div className={style.bar} style={{ width: `${state.notch}%` }} />
				<div className={style.track} onMouseDown={this.handleMousedown} ref={this.track}>
					<div className={style.grabber} ref={this.grabber} style={{ left: `${state.notch}%` }} />
				</div>
				<Tooltip forRef={this.grabber}>{state.value + this.props.unit}</Tooltip>
			</div>
		);
	}

}
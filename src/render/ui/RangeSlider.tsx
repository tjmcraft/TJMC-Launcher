import { FC, createElement, memo, useCallback, useMemo, useRef, useState } from "react";
import { getPos } from "Libs/ElementEx";
import style from "CSS/slider.module.css";
import { randomString } from "Util/Random";
import { toFixedNumber } from "Util/Numbers";
import Tooltip from "./Tooltip";

type OwnProps = {
	id?: string;
	value: number;
	min: number;
	max: number;
	step?: number;
	onChange: AnyFunction;
	unit: string;
};

const RangeSlider: FC<OwnProps> = ({
	id = undefined,
	value = 0,
	min = 0,
	max = 100,
	step = 1,
	onChange = void 0,
	unit = '',
}) => {

	id = id || `slider-${randomString(5)}`;

	const meta = useMemo(() => {
		const val = {
			max: Number(max),
			min: Number(min),
			step: Number(step),
			inc: 0,
			ticks: 0,
		};
		val.ticks = (val.max - val.min) / val.step;
		val.inc = 100 / val.ticks;
		return val;
	}, [max, min, step]);

	const valRef = useRef(value);
	const [currentNotch, setCurrentNotch] = useState(((value - meta.min) / meta.step) * meta.inc);
	const [popupOpen, setPopupOpen] = useState(false);

	const trackRef = useRef(undefined);
	const grabberRef = useRef(undefined);

	const handleMousemove = useCallback((e) => {
		const pos = getPos(trackRef.current);
		const diff = e.pageX - pos.left;
		const percent = Math.max(Math.min(toFixedNumber((diff / trackRef.current.offsetWidth) * 100, 1), 100), 0);
		const notch = Math.max(Math.min(toFixedNumber(percent / meta.inc, 0) * meta.inc, 100), 0);
		if (Math.abs(percent - notch) < meta.inc / 2) {
			const value = Math.round((meta.min + (meta.step * (notch / meta.inc))) * 100) / 100;
			const event = new MouseEvent("change", {
				bubbles: false,
				cancelable: true
			});
			let cancelled = !trackRef.current.dispatchEvent(event);
			if (!cancelled) {
				valRef.current = value;
				setCurrentNotch(notch);
				setPopupOpen(true);
			}
		}
	}, [meta]);

	const handleMouseup = useCallback(() => {
		document.removeEventListener("mouseup", handleMouseup);
		document.removeEventListener("mousemove", handleMousemove);
		setPopupOpen(false);
		if (typeof onChange === "function") {
			onChange.call(this, valRef.current);
			console.debug(">>>", valRef.current);
		}
	}, [handleMousemove, onChange]);

	const handleMousedown = useCallback((e) => {
		document.addEventListener("mouseup", handleMouseup);
		document.addEventListener("mousemove", handleMousemove);
		handleMousemove(e);
	}, [handleMousemove, handleMouseup]);

	return (
		<div className={style.slider} id={id}>
			<div className={style.bar} style={{ width: `${currentNotch}%` }} />
			<div className={style.track} onMouseDown={handleMousedown} onMouseUp={handleMouseup} ref={trackRef}>
				<div className={style.grabber} ref={grabberRef} style={{ left: `${currentNotch}%` }} />
			</div>
			<Tooltip forRef={grabberRef} isOpen={popupOpen}>{valRef.current + unit}</Tooltip>
		</div>
	);
};

export default memo(RangeSlider);
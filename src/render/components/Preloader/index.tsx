import React, { createElement, useEffect } from "react";

import useShowTransition from "Hooks/useShowTransition";
import useFlag from "Hooks/useFlag";

import { getState } from "Store/Global";
import buildClassName from "Util/buildClassName";

import style from "./preloader.module.css";
import iconImage from "IMG/icon.png";

const Preloader = () => {

	const shouldShow = getState(global => global.settings.enable_preloader);
	const [isPreloaderOpen, _$openPreloader, $closePreloader] = useFlag(shouldShow);

	useEffect(() => {
		setTimeout(() => {
			$closePreloader();
		}, 1500);
	}, [$closePreloader]); // used for show transitions

	const {
		shouldRender,
		transitionClassNames,
	} = useShowTransition(
		isPreloaderOpen, undefined, true, undefined, false, { open: style.show }, 1000
	);

	return shouldRender && (
		<div className={buildClassName(style.preloader, transitionClassNames)}>
			<img className={buildClassName(style.logo, style.bounce)} src={iconImage} />
			<div className={style.circle} />
			<div className={style.circle} />
		</div>
	);
};

export default Preloader;
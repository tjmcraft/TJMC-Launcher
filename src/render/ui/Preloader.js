import { createElement, useEffect } from "react";

import useShowTransition from "Hooks/useShowTransition";
import useFlag from "Hooks/useFlag";

import { getState } from "Util/Store";
import buildClassName from "Util/buildClassName";

import style from "CSS/preloader.module.css";
import iconImage from "IMG/icon.png";

const Preloader = () => {

	const shouldShow = getState(global => global.settings.enable_preloader);
	const [isPreloaderOpen, $openPreloader, $closePreloader] = useFlag(shouldShow);

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
		<div class={buildClassName(style.preloader, transitionClassNames)}>
			<img class={buildClassName(style.logo, style.bounce)} src={iconImage} />
			<div class={style.circle} />
			<div class={style.circle} />
		</div>
	);
};

export default Preloader;
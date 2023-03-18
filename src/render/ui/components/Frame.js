import { createElement } from "react";

import style from "CSS/frame.module.css";
import buildClassName from "Util/buildClassName";


export function Frame({ title = "" }) {
	if (window.system?.os == 'osx') return null;
	const onClose = () => window.tjmcNative.window.close();
	const onMaximize = () => window.tjmcNative.window.maximize();
	const onMinimize = () => window.tjmcNative.window.minimize();
	return (
		<div className={style.frame}>
			<div className={style.content}>
				<div className={style.frameWordmark}>
					<span className={style.title}>{ title || APP_NAME || "TJMC-Launcher" }</span>
				</div>
				<div className={style.frameButtonDock}>
					<div className={buildClassName(style.frameButton, style.default)} onClick={onMinimize}>
						<svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12">
							<rect fill="currentColor" width="10" height="1" x="1" y="6" />
						</svg>
					</div>
					<div className={buildClassName(style.frameButton, style.default)} onClick={onMaximize}>
						<svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12">
							<rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="currentColor" />
						</svg>
					</div>
					<div className={buildClassName(style.frameButton, style.close)} onClick={onClose}>
						<svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12">
							<polygon fill="currentColor" fill-rule="evenodd" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1" />
						</svg>
					</div>
				</div>
			</div>
		</div>
	);
}
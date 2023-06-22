import { Fragment, createElement } from "react";

import "Model/Actions/UI";
import "Model/Actions/Api";
import "Model/Actions/Host";
import "Model/Actions/Initial";
import "Model/Actions/Installations";
import { getDispatch, getState } from "Store/Global";

// @ts-ignore
import BuildInfo from "!webpack-plugin-buildinfo?gitHashShort&time!";
import platform from "platform";

import './assets/css/launcher.css';

getDispatch().init(); // for state cache load

window.buildInfo = BuildInfo;
window.__debug__ = getState(state => state.settings.debug_mode);
window.__debug_host__ = getState(state => state.settings.debug_host);
window.__debug_api__ = getState(state => state.settings.debug_api);
window.__debug__ && console.debug('Global ENV:', window.GLOBAL_ENV);
window.__debug__ && console.debug('Platform:', platform);
window.__debug__ && console.debug('Build Info:', window.buildInfo);

import Frame from "UI/components/Frame";
import App from "UI/App";
import LayerContainer from "UI/LayerContainer";

export default function Root() {
	return (
		<Fragment>
			<Frame />
			<App />
			<LayerContainer />
		</Fragment>
	);
}
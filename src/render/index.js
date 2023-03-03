import { render } from "react-dom";
import { Fragment, createElement } from "react";

import { Frame } from "UI/components/Frame.js";
import App from "UI/App.js";
import LayerContainer from "UI/LayerContainer.js";

import "Model/Actions/UI";
import "Model/Actions/Api";
import "Model/Actions/Host";
import "Model/Actions/Initial";
import "Model/Actions/Installations";
import { getDispatch, getState } from "Util/Store";

import platform from "platform";
import BuildInfo from "!webpack-plugin-buildinfo?gitHashShort&time!";

import './assets/css/launcher.css';


getDispatch().init(); // for state cache load

window.buildInfo = BuildInfo;
window.__debug__ = getState(state => state.settings.debug_mode);
window.__debug_host__ = getState(state => state.settings.debug_host);
window.__debug_api__ = getState(state => state.settings.debug_api);
window.__debug__ && console.debug('Global ENV:', window.GLOBAL_ENV);
window.__debug__ && console.debug('Platform:', platform);
window.__debug__ && console.debug('Build Info:', window.buildInfo);

const Root = () => (
	<Fragment>
		<Frame />
		<App />
		<LayerContainer />
	</Fragment>
);

render(<Root />, document.getElementById('app-mount'));
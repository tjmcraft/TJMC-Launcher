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

import Platform from "Util/Platform.js";
import BuildInfo from "!webpack-plugin-buildinfo?gitHashShort&time!";

import './assets/css/launcher.css';

window.platform = Platform;
window.buildInfo = BuildInfo;

getDispatch().init(); // for state cache load

window.__debug__ = getState(state => state.settings.debug_mode);
window.__debug_host__ = getState(state => state.settings.debug_host);
window.__debug_api__ = getState(state => state.settings.debug_api);
window.__debug__ && console.debug('Global ENV:', GLOBAL_ENV);
window.__debug__ && console.debug('Platform:', platform);
window.__debug__ && console.debug('Build Info:', buildInfo);

const Root = () => (
	<Fragment>
		<Frame />
		<App />
		<LayerContainer />
	</Fragment>
);

render(<Root />, document.getElementById('app-mount'));
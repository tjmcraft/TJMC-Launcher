import { createElement } from "react";
import { render } from "react-dom";

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

let mount = document.getElementById('app-mount'), root;

function init() {
	let RootNode = require('./components/App').default;
	root = render(<RootNode />, mount, root);
}

if (module.hot) module.hot.accept('./components/App', init);

init();
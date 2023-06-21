import { createElement } from "react";
import { render } from "react-dom";

let mount = document.getElementById('app-mount'), root;

function init() {
	let RootNode = require('./root').default;
	root = render(<RootNode />, mount, root);
}

if (module.hot) module.hot.accept('./root', init);

init();
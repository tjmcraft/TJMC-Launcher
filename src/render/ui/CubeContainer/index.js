import { createElement } from "react";
import MainSidebar from "UI/MainSidebar";
import CubeSidebar from "./CubeSidebar";
import CubeContent from "./CubeMainContent";

const CubeContainer = () => {
	return (
		createElement('div', { id: 'cube', class: 'base', },
			createElement('div', { class: 'content' },
				createElement(MainSidebar, null,
					createElement(CubeSidebar)),
				createElement(CubeContent),))
	);
};

export default CubeContainer;
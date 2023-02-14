import { createElement, useState, useCallback, memo } from "react";

import MainSidebar from "UI/MainSidebar";
import MainContent from "./MainContent";
import Sidebar from "./Sidebar";

const MainContainer = memo(() => {

	const [activeScreen, setScreen] = useState("main");

	const handleScreenSelect = useCallback((screen) => {
		setScreen(screen);
	}, [setScreen]);

	return (
		<div id="main" className="base">
			<div className="content">
				<MainSidebar>
					<Sidebar
						currentScreen={activeScreen}
						onScreenSelect={handleScreenSelect}
					/>
				</MainSidebar>
				<MainContent
					currentScreen={activeScreen}
				/>
			</div>
		</div>
	);
});

export default MainContainer;
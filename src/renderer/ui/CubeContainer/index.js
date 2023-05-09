import { createElement, memo } from "react";
import MainSidebar from "UI/MainSidebar";
import CubeSidebar from "./CubeSidebar";
import CubeContent from "./CubeMainContent";

const CubeContainer = () => {
	return (
		<div className="base" id="cube">
			<div className="content">
				<MainSidebar>
					<CubeSidebar />
				</MainSidebar>
				<CubeContent />
			</div>
		</div>
	);
};

export default memo(CubeContainer);
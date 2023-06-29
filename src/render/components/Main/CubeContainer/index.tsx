import { createElement, memo } from "react";
import MainSidebar from "Components/Main/MainSidebar";
import CubeSidebar from "./CubeSidebar";
import CubeContent from "./CubeContent";

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
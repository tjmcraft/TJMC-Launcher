import { createElement, memo } from "react";
import buildClassName from "Util/buildClassName";

const MainContent = ({ currentScreen }) => {
	return (
		<div className={buildClassName("main-content", "d-flex", "centred")}>
			<h1>Main content - {currentScreen}</h1>
		</div>
	);
};

export default memo(MainContent);
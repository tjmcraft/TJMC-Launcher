import { createElement, memo } from "react";

const PendingProgress = () => {
	return (
		<div className="process-container">
			<div className="dot-bricks" />
		</div>
	);
};

export default memo(PendingProgress);
import { createElement, memo } from "react";

const PendingProgress = memo(() => {
	return (
		<div className="process-container">
			<div className="dot-bricks" />
		</div>
	);
});

export default PendingProgress;
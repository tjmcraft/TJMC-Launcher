import { FC, createElement, memo } from "react";

const PendingProgress: FC = () => {
	return (
		<div className="process-container">
			<div className="dot-bricks" />
		</div>
	);
};

export default memo(PendingProgress);
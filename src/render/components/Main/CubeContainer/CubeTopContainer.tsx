import { memo, createElement } from "react";
import CubeTopToolbar from "./CubeTopToolbar";

const CubeTopContainer = ({ hash }) => {
	return (
		<div className="top">
			<img src={require('IMG/1042-1920x1080.jpg')} />
			<div className="top-overlay">
				<CubeTopToolbar hash={hash} />
			</div>
		</div>
	);
};

export default memo(CubeTopContainer);
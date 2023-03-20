import { memo, createElement } from "react";
import CubeTopToolbar from "./CubeTopToolbar";

const CubeTopContainer = ({ hash }) => {
	return (
		<div className="top">
			<img src={"https://fastly.picsum.photos/id/1042/1920/1080.jpg?hmac=5rahPD39JBm45i1Hx74k_G0gCqn8p6YH3XBjASydtU4"} />
			<div className="top-overlay">
				<CubeTopToolbar hash={hash} />
			</div>
		</div>
	);
};

export default memo(CubeTopContainer);
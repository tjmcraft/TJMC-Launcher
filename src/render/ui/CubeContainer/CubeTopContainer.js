import { memo, createElement } from "react";
import CubeTopToolbar from "./CubeTopToolbar";

const CubeTopContainer = memo(({ hash }) => {
	return (
		<div class="top">
			<img src={"https://picsum.photos/1920/1080?v=2"} />
			<div class="top-overlay">
				<CubeTopToolbar hash={hash} />
			</div>
		</div>
	);
});

export default CubeTopContainer;
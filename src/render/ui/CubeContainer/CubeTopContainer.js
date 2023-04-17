import { memo, createElement } from "react";
import CubeTopToolbar from "./CubeTopToolbar";

const imageLink = false ? "https://cdn.tjmc.ru/images/waves-of-blue.jpg" :
	"https://cdn.tjmc.ru/images/1042-1920x1080.jpg";

const CubeTopContainer = ({ hash }) => {
	return (
		<div className="top">
			<img src={imageLink} />
			<div className="top-overlay">
				<CubeTopToolbar hash={hash} />
			</div>
		</div>
	);
};

export default memo(CubeTopContainer);
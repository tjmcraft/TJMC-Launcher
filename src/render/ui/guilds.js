import { createElement } from "react";
import buildClassName from "Util/buildClassName";
import { randomString } from "Util/Random";

export const Guild = ({
	id = undefined,
	type,
	onClick = void 0,
	image = null,
	svg = null,
	selected = false
}) => {
	id = id || randomString(3);
	const onclick = (e) => {
		// console.debug("sel", id)
		if (typeof onClick === 'function') onClick.call(this, e);
	};
	return (
		<div className={buildClassName('listItem', selected && "selected")}>
			{type == 'separator' ?
				<div className="guildSeparator" /> :
				<div className="wrapper" onClick={onclick}>
					{image ? <img src={image} alt="image" /> : <div className="singleIconBtn">{svg || id}</div>}
				</div>
			}
		</div>
	);
};
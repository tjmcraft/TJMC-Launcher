import { createElement } from "react";

const RoundProgress = ({ progress = 0 }) => {
	const radius = 14;
	let dashOffset = 0;
	progress = parseInt(progress);
	if (isNaN(progress)) {
		progress = 100;
	} else {
		let c = Math.PI * (radius * 2);
		if (progress < 0) progress = 0;
		if (progress > 100) progress = 100;
		dashOffset = ((100 - progress) / 100) * c;
	}
	return (
		<div class='progress-container'>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox='0 0 48 48' data-icon='progress-circle'>
				<g>
					<circle r={radius} cx="24" cy="24" fill="transparent" stroke-dasharray="100" stroke-dashoffset="0" />
					<circle id="bar" r={radius} cx="24" cy="24" fill="transparent" stroke-dasharray="87.96459430051421" stroke-dashoffset="0" style={{'stroke-dashoffset': `${dashOffset}px`}} />
				</g>
			</svg>
		</div>
	);
};

export default RoundProgress;
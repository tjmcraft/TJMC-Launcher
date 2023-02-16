import { createElement } from "react";

import buildClassName from "Util/buildClassName";

import './Spinner.css';


const Spinner = ({
	color = 'blue'
}) => {
	return (
		<div className={buildClassName("Spinner", color)}>
			<div />
		</div>
	);
};

export default Spinner;
import { createElement } from "react";

import buildClassName from "Util/buildClassName";

import './Spinner.css';


const Spinner = ({
	color = 'blue',
	size = 1
}) => {
	const sizeClass = ({
		1: "size1",
		2: "size2",
		3: "size3",
	})[size];
	return (
		<div className={buildClassName("Spinner", color, sizeClass)}>
			<div />
		</div>
	);
};

export default Spinner;
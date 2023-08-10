import { FC, createElement, memo } from "react";

import buildClassName from "Util/buildClassName";

import './Spinner.css';

type OwnProps = {
	color: 'blue' | 'white';
	size?: 1 | 2 | 3;
};

const Spinner: FC<OwnProps> = ({
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

export default memo(Spinner);
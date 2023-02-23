import { createElement, useCallback, useState } from "react";
import buildClassName from "Util/buildClassName";
import Spinner from "./Spinner";
import { randomString } from "Util/Random";

const CLICKED_TIMEOUT = 400;

const Button = ({
	id = undefined,
	type = "button",
	className = undefined,
	onClick = void 0,
	disabled = false,
	children,
	isText = false,
	isLoading = false,
}) => {

	id = id || `btn-${randomString(5)}`;

	const [isClicked, setIsClicked] = useState(false);

	const handleClick = useCallback((e) => {
		if (!disabled && onClick) {
			onClick(e);
		}
		setIsClicked(true);
		setTimeout(() => {
			setIsClicked(false);
		}, CLICKED_TIMEOUT);
	}, [disabled, onClick]);

	const fullClassName = buildClassName(
		className,
		'Button',
		isText && 'text',
		disabled && 'disabled',
		isLoading && 'loading',
		isClicked && 'clicked'
	);

	return (
		<button
			id={id}
			type={type}
			className={fullClassName}
			onClick={handleClick}
			disabled={disabled}
		>
			{isLoading ? (
				<div>
					<span>Please wait...</span>
					<Spinner color={isText ? 'blue' : 'white'} />
				</div>
			) : <div className="content">{children}</div>}

		</button>
	);
};

export default Button;
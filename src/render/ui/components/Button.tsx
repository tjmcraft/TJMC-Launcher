import React, { createElement, useCallback, useState, MouseEvent as ReactMouseEvent, FC } from "react";
import buildClassName from "Util/buildClassName";
import Spinner from "./Spinner";
import { randomString } from "Util/Random";

const CLICKED_TIMEOUT = 400;

type OwnProps = {
	id?: string;
	type?: 'button' | 'submit' | 'reset';
	className?: string;
	disabled?: boolean;
	children: React.ReactNode;
	isFilled?: boolean;
	isPrimary?: boolean;
	isRed?: boolean;
	isLoading?: boolean;
	onClick?: (e: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const Button: FC<OwnProps> = ({
	id = undefined,
	type = "button",
	className = undefined,
	onClick = void 0,
	disabled = false,
	children,
	isFilled = false,
	isPrimary = false,
	isRed = false,
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
		isFilled && 'filled',
		isRed && 'colorRed',
		isPrimary && 'colorBrand',
		disabled && 'disabled',
		isLoading && 'loading',
		isClicked && 'clicked'
	);

	return (
		<button
			id={id}
			type={type}
			tabIndex={0}
			role="button"
			className={fullClassName}
			onClick={handleClick}
			disabled={disabled}
		>
			{isLoading ? (
				<div>
					<span>{children}</span>
					<Spinner color={(isFilled && (isPrimary || isRed)) ? 'white' : 'blue'} />
				</div>
			) : <div className="content">{children}</div>}

		</button>
	);
};

export default Button;
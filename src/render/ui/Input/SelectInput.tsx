import { createElement, FC, memo, ReactNode, useCallback, useRef, useState } from "react";

import buildClassName from "Util/buildClassName";
import { randomString } from "Util/Random";

import { InputGroup } from "UI/Input";
import Menu from "../Menu";

import inputStyle from "./input.module.css";

type OwnProps = {
	id?: string;
	children: ReactNode;
	onInput?: AnyToVoidFunction;
	onOpen?: AnyToVoidFunction;
	onClose?: AnyToVoidFunction;
	onBlur?: AnyToVoidFunction;
	title?: string;
	value: string;
};

const Select: FC<OwnProps> = ({
	id = undefined,
	children,
	onInput = void 0,
	onOpen = void 0,
	onClose = void 0,
	onBlur = void 0,
	title = undefined,
	value,
}) => {
	id = id || randomString(5);
	const dropdownRef = useRef(null);
	const inputRef = useRef(null);
	const [isOpen, setIsOpen] = useState(false);

	const toggleIsOpen = () => {
		setIsOpen(!isOpen);
		if (isOpen) {
			if (onClose) onClose();
		} else {
			inputRef.current?.focus();
			if (onOpen) onOpen();
		}
	};

	const handleTrigger = () => {
		if (isOpen) {
			return;
		}
		toggleIsOpen();
	};

	const handleInput = (e) => {
		handleTrigger();
		onInput(e);
	};

	const handleClose = useCallback(() => {
		setIsOpen(false);
		if (onClose) onClose();
		inputRef.current?.blur();
	}, [onClose]);


	return (
		<div className={inputStyle.select} ref={dropdownRef}>
			<InputGroup title={title} htmlFor={id}>
				<input
					ref={inputRef}
					type="text"
					id={id}
					autoComplete="off"
					onClick={handleTrigger}
					onFocus={handleTrigger}
					onInput={handleInput}
					onBlur={onBlur}
					value={value}
				/>
				<div
					className={inputStyle.toggleIcon}
					role="button"
					tabIndex={0}
					onClick={toggleIsOpen}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" className={buildClassName("button-1w5pas", isOpen && "open")}>
						<g fill="none" fill-rule="evenodd">
							<path d="M0 0h18v18H0" />
							<path stroke="currentColor" d="M4.5 4.5l9 9" stroke-linecap="round" />
							<path stroke="currentColor" d="M13.5 4.5l-9 9" stroke-linecap="round" />
						</g>
					</svg>
				</div>
			</InputGroup>
			<Menu
				full={true}
				isOpen={isOpen}
				containerRef={dropdownRef}
				onClose={handleClose}
				transformOriginY={0}
			>
				{children}
			</Menu>
		</div>
	);
};

export default memo(Select);
import { createElement, useState, useRef, useCallback, useEffect } from "react";

import buildClassName from "Util/buildClassName";

import { randomString } from "Util/Random";
import { selectFile, selectFolder } from "Model/Actions/Host";
import captureEscKeyListener from "Util/captureEscKeyListener";

import style from "CSS/input.module.css";


export function InputText({
	ref = undefined,
	id = undefined,
	className = undefined,
	name = undefined,
	value = undefined,
	label = undefined,
	error = undefined,
	disabled = false,
	readOnly = false,
	placeholder = undefined,
	autoComplete = undefined,
	maxLength = undefined,
	autoFocus = false,
	required = false,
	onChange = void 0,
	onInput = void 0,
	onClear = void 0,
	small = false,
}) {

	id = id || `inp-${randomString(5)}`;
	let inputRef = useRef(undefined);
	if (ref) {
		inputRef = ref;
	}

	const fullClassName = buildClassName(
		className,
		style.inputGroup,
		error && style.error,
		disabled && style.disabled,
		readOnly && style.disabled,
	);

	const canClear = typeof onClear === 'function' && value?.length > 0;

	return (
		<div className={fullClassName}>
			{(label || error) && (
				<label htmlFor={id}>
					{label}
					{error && <span> - {error}</span>}
				</label>
			)}
			<span className={buildClassName(style.inputWrapper, small && style.small)}>
				<input
					ref={inputRef}
					id={id}
					name={name}
					className={""}
					type="text"
					value={value || ''}
					autoFocus={autoFocus}
					autoComplete={autoComplete}
					required={required}
					placeholder={placeholder}
					maxLength={maxLength}
					disabled={disabled}
					readOnly={readOnly}
					onChange={onChange}
					onInput={onInput}
				/>
				<div
					className={style.toggleIcon}
					role="button"
					tabIndex={0}
					onClick={onClear}
					style={{ ...(!canClear ? { display: 'none' } : {} )}}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" className={buildClassName("button-1w5pas", "open")}>
						<g fill="none" fill-rule="evenodd">
							<path d="M0 0h18v18H0" />
							<path stroke="currentColor" d="M4.5 4.5l9 9" stroke-linecap="round" />
							<path stroke="currentColor" d="M13.5 4.5l-9 9" stroke-linecap="round" />
						</g>
					</svg>
				</div>
			</span>
		</div>
	);
}

export function InputPassword({
	ref, id, className, name,
	value, label, error,
	disabled, readOnly,
	placeholder, autoComplete, maxLength, autoFocus, required,
	onChange, onInput,
	isPasswordVisible, onChangePasswordVisibility,
}) {

	const fullClassName = buildClassName(
		className,
		style.inputGroup,
		error && style.error,
		disabled && style.disabled,
		readOnly && style.disabled,
	);

	function togglePasswordVisibility() {
		onChangePasswordVisibility(!isPasswordVisible);
	}

	return (
		<div className={fullClassName}>
			{(label || error) && (
				<label htmlFor={id}>
					{label}
					{error && <span> - {error}</span>}
				</label>
			)}
			<span className={style.inputWrapper}>
				<input
					ref={ref}
					id={id}
					className={""}
					name={name}
					type={isPasswordVisible ? 'text' : 'password'}
					value={value || ''}
					autoFocus={autoFocus}
					autoComplete={autoComplete}
					required={required}
					placeholder={placeholder}
					maxLength={maxLength}
					disabled={disabled}
					readOnly={readOnly}
					onChange={onChange}
					onInput={onInput}
				/>
				<div
					className={style.toggleIcon}
					onClick={togglePasswordVisibility}
					role="button"
					tabIndex={0}
					title="Toggle password visibility"
				>
					{isPasswordVisible ? (
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<g>
								<path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
								<path d="M2 12C3.60014 7.90264 7.33603 5 12 5C16.664 5 20.3999 7.90264 22 12C20.3999 16.0974 16.664 19 12 19C7.33603 19 3.60014 16.0974 2 12Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
							</g>
						</svg>
					) : (
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<g>
								<path d="M10.7302 5.07319C11.1448 5.02485 11.5684 5 11.9999 5C16.6639 5 20.3998 7.90264 21.9999 12C21.6053 13.0104 21.0809 13.9482 20.4446 14.7877M6.51956 6.51944C4.47949 7.76406 2.90105 9.69259 1.99994 12C3.60008 16.0974 7.33597 19 11.9999 19C14.0375 19 15.8979 18.446 17.4805 17.4804M9.87871 9.87859C9.33576 10.4215 8.99994 11.1715 8.99994 12C8.99994 13.6569 10.3431 15 11.9999 15C12.8284 15 13.5785 14.6642 14.1214 14.1212" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
								<path d="M4 4L20 20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
							</g>
						</svg>
					)}
				</div>
			</span>
		</div>
	);
}

export function InputGroup({ htmlFor, title = undefined, children, inRef = undefined }) {
	return (
		<div className={style.inputGroup}>
			{title && (
				<span className={style.head}>
					<label htmlFor={htmlFor}>{title}</label>
				</span>
			)}
			<span className={style.inputWrapper} ref={inRef}>{children}</span>
		</div>
	);
}

export function ActionBlock(props) {
	return (
		<div className={style.actionBlock}>
			{props.children}
		</div>
	);
}


/**
 * PathInput Component
 * @param {object} params
 * @param {'path'|'file'} [params.type='path'] type of input
 * @param {Function} [params.onChange] onChange handler
 * @param {string} [params.id] id of element
 * @param {string} [params.value] value
 * @param {string} [params.title] title for label
 * @param {string} [params.placeholder] placeholder for input
 * @param {string} [params.buttonTitle] button title for select
 * @returns {JSX.Element}
 */
export const PathInput = ({
	type = "path",
	onChange = (folder) => folder,
	id = undefined,
	value = undefined,
	title = undefined,
	placeholder = undefined,
	buttonTitle = "Обзор"
}) => {
	id = id || randomString(5);
	const dropdownRef = useRef(null);
	const inputRef = useRef(null);

	const [isSelecting, setIsSelecting] = useState(false);
	const [isPromptOpen, setIsPromptOpen] = useState(false);
	const [path, setPath] = useState(value);
	useEffect(() => setPath(value), [value]);

	const handleChangeSelect = useCallback((result) => {
		setIsPromptOpen(false);
		if (result) {
			const path = result[0];
			if (typeof onChange === 'function') onChange(path);
		}
	}, [onChange]);

	const handleSelect = useCallback(() => {
		setIsPromptOpen(true);
		if (type == "path") {
			selectFolder({ title: "Select CWD" }).then(handleChangeSelect);
		} else if (type == "file") {
			selectFile({ title: "Select File" }).then(handleChangeSelect);
		}
	}, [type, handleChangeSelect]);

	useEffect(() => isPromptOpen && setIsSelecting(isPromptOpen), [isPromptOpen]);
	useEffect(() => isSelecting && captureEscKeyListener(() => setIsSelecting(false)), [isSelecting]);
	useEffect(() => isSelecting ? inputRef.current.focus() : inputRef.current.blur(), [isSelecting]);

	const handleInput = (e) => {
		// onInput(e.target.value);
		setPath(e.target.value);
	};

	const handleFocus = (e) => {
		setIsSelecting(true);
	};

	const handleBlur = (e) => {
		e.preventDefault();
		if (!isPromptOpen) {
			setIsSelecting(false);
			if (typeof onChange === 'function') onChange(path);
		}
	};

	return (
		<div className="InputPath" ref={dropdownRef}>
			<InputGroup title={title} htmlFor={id}>
				<input
					ref={inputRef}
					id={id}
					type="text"
					autoComplete="off"
					onInput={handleInput}
					onFocus={handleFocus}
					onBlur={handleBlur}
					value={path}
					placeholder={placeholder}
				/>
				<div
					className={style.actionButton}
					role="button"
					tabIndex={0}
					onClick={handleSelect}
				>
					{buttonTitle}
				</div>
			</InputGroup>
		</div>
	);

};
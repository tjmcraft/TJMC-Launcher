import { createElement, memo } from "react";

import buildClassName from "Util/buildClassName";

import style from "./input.module.css";

const PasswordInput = ({
	ref, id, className, name,
	value, label, error,
	disabled, readOnly,
	placeholder, autoComplete, maxLength, autoFocus, required,
	onChange, onInput,
	isPasswordVisible, onChangePasswordVisibility,
}) => {

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
};

export default memo(PasswordInput);
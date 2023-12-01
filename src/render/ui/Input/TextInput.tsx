import { createElement, useRef, memo, forwardRef, HTMLInputTypeAttribute, useEffect } from "react";

import buildClassName from "Util/buildClassName";
import { randomString } from "Util/Random";

import style from "./input.module.css";
import useInputFocusOnOpen from "Hooks/useInputFocusOnOpen";

type OwnProps = {
	id?: string,
	className?: string,
	inputClassName?: string,
	name?: string,
	value?: any,
	label?: string,
	title?: string,
	type?: HTMLInputTypeAttribute,
	error?: any,
	disabled?: boolean,
	readOnly?: boolean,
	placeholder?: string,
	autoComplete?: any,
	maxLength?: number,
	autoFocus?: boolean,
	autoFocusOnOpen?: boolean,
	focused?: boolean,
	required?: boolean,
	onChange?: AnyToVoidFunction,
	onInput?: AnyToVoidFunction,
	onClear?: AnyToVoidFunction,
	small?: boolean,
	withClear?: boolean,
};

const TextInput = forwardRef<HTMLInputElement, OwnProps>(({
	id = undefined,
	className = undefined,
	inputClassName = undefined,
	name = undefined,
	value = undefined,
	label = undefined,
	title = undefined,
	type = 'text',
	error = undefined,
	disabled = false,
	readOnly = false,
	placeholder = undefined,
	autoComplete = undefined,
	maxLength = undefined,
	autoFocus = false,
	autoFocusOnOpen = false,
	focused = undefined,
	required = false,
	onChange = void 0,
	onInput = void 0,
	onClear = void 0,
	small = false,
	withClear = false,
}, ref) => {

	id = id || `inp-${randomString(5)}`;
	let inputRef = useRef<HTMLInputElement>(null);
	if (ref) {
		// @ts-ignore
		inputRef = ref;
	}

	useInputFocusOnOpen(inputRef, autoFocusOnOpen);

	useEffect(() => {
    if (!inputRef.current) return;
    if (focused) {
      inputRef.current.focus();
    } else {
      inputRef.current.blur();
    }
  }, [focused, placeholder]);

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
					className={inputClassName}
					type={type}
					title={title}
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
				{withClear && (
					<div
						className={style.toggleIcon}
						role="button"
						tabIndex={0}
						onClick={onClear}
						style={{ ...(!canClear ? { display: 'none' } : {}) }}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" className={buildClassName("button-1w5pas", "open")}>
							<g fill="none" fill-rule="evenodd">
								<path d="M0 0h18v18H0" />
								<path stroke="currentColor" d="M4.5 4.5l9 9" stroke-linecap="round" />
								<path stroke="currentColor" d="M13.5 4.5l-9 9" stroke-linecap="round" />
							</g>
						</svg>
					</div>
				)}
			</span>
		</div>
	);
});

export default memo(TextInput);
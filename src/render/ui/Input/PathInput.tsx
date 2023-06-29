import { createElement, useState, useRef, useCallback, useEffect, memo } from "react";

import { randomString } from "Util/Random";
import { selectFile, selectFolder } from "Model/Actions/Host";
import captureEscKeyListener from "Util/captureEscKeyListener";

import InputGroup from "./InputGroup";
import style from "./input.module.css";

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
const PathInput = ({
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

	const handleFocus = () => {
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

export default memo(PathInput);
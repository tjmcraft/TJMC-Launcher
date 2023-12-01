import { RefObject, useEffect } from "react";

// Focus slows down animation, also it breaks transition layout in Chrome
const FOCUS_DELAY_MS = 300;
const MODAL_HIDE_DELAY_MS = 300;

export default function useInputFocusOnOpen(
	inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement>,
	isOpen?: boolean,
	onClose?: NoneToVoidFunction
) {
	useEffect(() => {
		if (isOpen) {
			setTimeout(() => {
				if (inputRef.current?.isConnected) {
					inputRef.current.focus();
				}
			}, FOCUS_DELAY_MS);
		} else {
			if (inputRef.current?.isConnected) {
				inputRef.current.blur();
			}
			if (onClose) {
				setTimeout(onClose, MODAL_HIDE_DELAY_MS);
			}
		}
	}, [inputRef, isOpen, onClose]);
}
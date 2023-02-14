import captureKeyboardListeners from "./captureKeyboard";

export default function captureEscKeyListener(handler) {
	return captureKeyboardListeners({ onEsc: handler });
}
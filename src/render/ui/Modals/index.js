import { createElement } from "react";

import style from 'CSS/modal.module.css';
import buildClassName from "Util/buildClassName";

export const Modal = ({ children, mini, small, full }) => {

	const classNames = buildClassName(
		style.modal,
		mini && style.mini,
		small && style.small,
		full && style.full,
	);

	return (
		createElement("div", { class: classNames }, children)
	);
};

export const ModalFooter = ({ children }) => {
	return createElement('div', { class: style.verticalButtonContainer }, children);
};

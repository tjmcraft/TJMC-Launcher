import { createElement } from "react";

import style from 'CSS/modal.module.css';
import buildClassName from "Util/buildClassName";

export const Modal = ({
	children,
	mini = false,
	small = false,
	full = false,
	width = ''
}) => {

	const classNames = buildClassName(
		style.modal,
		mini && style.mini,
		small && style.small,
		full && style.full,
	);

	return <div className={classNames} role="alertdialog" tabIndex={-1} aria-modal="true" style={{width:width}}>{children}</div>;
};

export const ModalFooter = ({ children }) => {
	return <div className={style.verticalButtonContainer}>{children}</div>;
};

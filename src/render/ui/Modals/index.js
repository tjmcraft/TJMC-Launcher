import { createElement } from "react";

import style from 'CSS/modal.module.css';
import buildClassName from "Util/buildClassName";

export const Modal = ({
	children,
	mini = false,
	small = false,
	full = false,
}) => {

	const classNames = buildClassName(
		style.modal,
		mini && style.mini,
		small && style.small,
		full && style.full,
	);

	return <div className={classNames}>{children}</div>;
};

export const ModalFooter = ({ children }) => {
	return <div className={style.verticalButtonContainer}>{children}</div>;
};

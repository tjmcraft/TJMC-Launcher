import React, { createElement, useEffect, useRef } from "react";

import style from 'CSS/modal.module.css';
import buildClassName from "Util/buildClassName";
import trapFocus from "Util/focusTrap";

export const Modal: React.FC<{
	children: React.ReactNode;
	mini?: boolean;
	small?: boolean;
	full?: boolean;
	width?: string;
}> = ({
	children,
	mini = false,
	small = false,
	full = false,
	width = ''
}) => {

	const modalRef = useRef<HTMLDivElement>();

	useEffect(() => (modalRef.current ? trapFocus(modalRef.current) : undefined));

	const classNames = buildClassName(
		style.modal,
		mini && style.mini,
		small && style.small,
		full && style.full,
	);

	return <div ref={modalRef} className={classNames} role="alertdialog" tabIndex={-1} aria-modal="true" style={{width:width}}>{children}</div>;
};

export const ModalFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return <div className={style.verticalButtonContainer}>{children}</div>;
};

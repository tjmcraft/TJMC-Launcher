import { memo, createElement, useState, useMemo } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Store/Global";
import useGlobal from "Hooks/useGlobal";
import { SVG } from "UI/svg";

import { Modal, ModalFooter } from ".";

import style from 'CSS/modal.module.css';
import "./ShortcutsModal.css";

const Header = (({ title, subtitle = undefined }) => {
	const { closeModal } = getDispatch();
	const onClose = () => closeModal();
	return (
		<div className={buildClassName('flex-group', 'horizontal', style.header)}>
			<div className="flex-child">
				<h2>{title || 'Что нового?'}</h2>
				<div className={buildClassName('size12', 'colorStandart', style.date)}>
					{subtitle || ''}
				</div>
			</div>
			<div className="button" onClick={onClose}>{SVG('cross')}</div>
		</div>
	);
});

const Content = (({ children }) => createElement('div', { class: buildClassName(style.content, 'thin-s') }, children));

const ShortcutsModal = (props) => {
	const { closeModal } = getDispatch();
	return (
		<Modal mini={true} small={true} full={false}>
			<Header title={"Keyboard Shortcuts"} subtitle={"Control your experience!"} />
			<Content>
				<div className={buildClassName("colorStandart", "size14")}>
					<div className="sc-groups">
						<div className="sc-group">
							<span>General</span>
							<div className="sc-container">
								<div className="sc-title">
									<span>
										First shortcut
									</span>
								</div>
								<div className="sc-icon">
									<kbd>⌘</kbd>
									<kbd>k</kbd>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Content>
		</Modal>
	);
};

export default memo(ShortcutsModal);
import { createElement, Fragment, memo } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Store/Global";
import { SVG } from "../svg";

import { Modal, ModalFooter } from "UI/Modals";
import Button from "UI/components/Button";

import appStyle from 'CSS/app.module.css';
import style from 'CSS/modal.module.css';


const AlertContent = ({ title, content, type, multiline, buttons }) => {
	const { closeModal } = getDispatch();
	buttons = buttons || [
		{
			name: "Ок",
			class: ['filled', 'colorBrand'],
			closeOverlay: true
		}
	];
	const handleClick = (button) => (e) => {
		if (button.callback && typeof button.callback === 'function') button.callback.call(this);
		if (button.closeOverlay) closeModal();
	};
	return (
		<form>
			{title && (
				<div className={buildClassName('flex-group', 'horizontal', style.header)}>
					{type && (
						<div className={style.icon}>
							{{
								info: SVG('info-circle'),
								error: SVG('error-circle'),
								warn: SVG('warn-circle'),
								success: SVG('success-circle'),
							}[type] || null}
						</div>
					)}
					<h1 className={buildClassName('wrapper', 'sizeW', appStyle.base)}>{ title }</h1>
				</div>
			)}
			{content && (
				<div className={buildClassName(style.content, 'thin-s', multiline && style.log)}>
					<span className={buildClassName('colorStandart', 'size16')}>{ content }</span>
				</div>
			)}
			<ModalFooter>
				{buttons.map((button, i) => (
					<Button key={i}
						className={buildClassName('grow', style.button, button.class)}
						onClick={handleClick(button)}
					>{button.name}</Button>
				))}
			</ModalFooter>
		</form>
	);
};

const Alert = ({ title, content, type, multiline = false, buttons }) => {
	return (
		<Modal small={multiline} mini={!multiline}>
			<AlertContent
				title={title}
				content={content}
				type={type}
				multiline={multiline}
				buttons={buttons}
			/>
		</Modal>
	);
};

export default memo(Alert);
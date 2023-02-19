import { createElement, Fragment, memo } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Util/Store";
import { SVG } from "../svg";

import { Modal, ModalFooter } from "UI/Modals";
import Button from "UI/components/Button";

import appStyle from 'CSS/app.module.css';
import style from 'CSS/modal.module.css';


const AlertContent = memo(({ title, content, type, multiline, buttons }) => {
	const { closeModal } = getDispatch();
	buttons = buttons || [
		{
			name: "Ок",
			class: ['filled', 'colorBrand'],
			closeOverlay: true
		}
	];
	return (
		<>
			{title && (
				<div class={buildClassName('flex-group', 'horizontal', style.header)}>
					{type && (
						createElement("div", { class: style.icon },
							{
								info: SVG('info-circle'),
								error: SVG('error-circle'),
								warn: SVG('warn-circle'),
								success: SVG('success-circle'),
							}[type] || null)
					)}
					<h1 class={buildClassName('wrapper', 'size20', appStyle.base)}>{ title }</h1>
				</div>
			)}
			{content && (
				<div class={buildClassName(style.content, 'thin-s', multiline && style.log)}>
					<span class={buildClassName('colorStandart', 'size14')}>{ content }</span>
				</div>
			)}
			<ModalFooter>
				{buttons.map(button => {
					const onClick = () => {
						if (button.callback && typeof button.callback === 'function') button.callback.call(this);
						if (button.closeOverlay) closeModal();
					};
					return createElement(Button, {
						className: buildClassName('grow', style.button, button.class),
						onClick,
					}, button.name);
				})}
			</ModalFooter>
		</>
	);
});

const Alert = memo(({ title, content, type, multiline, buttons }) => {
	return createElement(Modal, { mini: true },
		createElement(AlertContent, { title, content, type, multiline, buttons }));
});

export default Alert;
import { memo, createElement } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Store/Global";
import useGlobal from "Hooks/useGlobal";

import { Modal } from "UI/Modal";

import style from 'CSS/modal.module.css';
import "./ShortcutsModal.css";
import platform from "platform";

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
			<div className="button" onClick={onClose}><i className="icon-close"></i></div>
		</div>
	);
});

const Content = (({ children }) => createElement('div', { class: buildClassName(style.content, 'thin-s') }, children));

const ShortcutsModal = () => {
	const host = useGlobal(global => global.hostInfo);
	const isMac = platform.os.family == 'OS X';
	const template = (host.hostMenu || [
		{
			label: "General",
			submenu: [
				{
					label: 'Check for updates',
					accelerator: 'Ctrl+Shift+U',
				},
				{
					label: 'Keyboard shortcuts',
					accelerator: isMac ? 'Command+/' : 'Ctrl+/',
				},
				{
					label: 'Settings',
					accelerator: 'Ctrl+Shift+I',
				},
				{
					label: 'Map',
					accelerator: 'Ctrl+Shift+M',
				},
				{
					label: 'Root Directory',
					accelerator: 'Ctrl+Shift+D',
				},
				{
					label: 'Quit',
					accelerator: isMac ? 'Command+Q' : 'Ctrl+Q',
				}
			],
		},
		{
			label: 'Installation',
			submenu: [
				{
					label: 'Start Launching',
					accelerator: 'F5',
				},
				{
					label: 'Start With Force',
					accelerator: 'Ctrl+F5',
				},
				{
					label: 'Stop Launching',
					accelerator: 'Shift+F5',
				},
				{
					label: 'Edit Current',
					accelerator: 'F4',
				},
				{
					label: 'Create new',
					accelerator: 'F3',
				},
			]
		},
	]).map(e => ({
		label: e.label,
		submenu: e.submenu.filter(e => e.accelerator && e.label)
	})).filter(e => e.submenu.length);
	return (
		<Modal mini small width="25em">
			<Header title={"Keyboard Shortcuts"} />
			<Content>
				<div className={buildClassName("colorStandart", "size14")}>
					<div className="sc-groups">
						{template.map(({ label, submenu }, key) => (
							<div className="sc-group" key={key}>
								<span>{label}</span>
								{submenu.map(({ label, accelerator }, key) => (
									<div className="sc-container" key={key}>
										<div className="sc-title">
											<span>{label}</span>
										</div>
										<div className="sc-icon">
											{accelerator.split("+").map((a, key) => (
												<kbd key={key}>{a}</kbd>
											))}
										</div>
									</div>
								))}
							</div>
						))}
					</div>
				</div>
			</Content>
		</Modal>
	);
};

export default memo(ShortcutsModal);
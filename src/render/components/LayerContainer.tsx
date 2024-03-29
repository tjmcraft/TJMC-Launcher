import React, { Fragment, createElement, memo, useEffect, useState } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch, getState } from "Store/Global";
import useGlobal from "Hooks/useGlobal";
import useShowTransition from "Hooks/useShowTransition";
import captureEscKeyListener from "Util/captureEscKeyListener";

import VersionChooser from "Components/Modals/VersionChooser";
import Alert from "Components/Modals/Alert";
import WhatsNew from "Components/Modals/WhatsNew";
import InstallationEditor from "Components/Modals/InstallationEditor";
import ShortcutsModal from "Components/Modals/ShortcutsModal";

import style from "CSS/modal.module.css";

const MODAL_STORE = {
	versionChooser: VersionChooser,
	alert: Alert,
	"whats-new": WhatsNew,
	"installation-editor": InstallationEditor,
	"shortcuts-modal": ShortcutsModal,
};

const ModalLayer = ({ isShown, children }: { isShown: boolean, children: React.ReactNode }) => {

	const { closeModal, onHideModal } = getDispatch();

	const params = Object.assign({}, {
		closeButton: true,
		allowOutsideClick: true,
		label: "layer-0", // if this appears -> thats a bug
	});

	const [isModalOpen, setModalOpen] = useState(false);

	useEffect(() => {
		setModalOpen(isShown);
	}, [isShown, setModalOpen]); // used for show transitions

	const onCloseEnd = () => onHideModal(params.label);

	useEffect(() => captureEscKeyListener(() => closeModal()), [closeModal]);

	const {
		transitionClassNames,
	} = useShowTransition(
		isModalOpen,
		onCloseEnd, false,
		undefined, false,
		{ open: style.show }, 300
	); // still need for properly unload

	const createToolsContainer = (closeModal = () => { }) => {
		return (
			<div className={buildClassName(style.tools, "frame-fix")}>
				<div className={style.closeButton} onClick={closeModal}><i className="icon-close"></i></div>
				<div className={style.keyCode}>{"ESC"}</div>
			</div>
		);
	};

	return (
		<div className={buildClassName(style.layer, transitionClassNames)}>
			<div className={buildClassName(style.backdrop)} data-layer-id={params.label} onClick={params.allowOutsideClick && closeModal} />
			{params.closeButton && createToolsContainer(closeModal)}
			{children}
		</div>
	);

};

const Modals = () => {
	const modals = useGlobal(global => global.modals);
	const isOpen = modals.length > 0;

	return (
		<Fragment>
			{
				isOpen &&
				modals.map((modal) => (
					<ModalLayer isShown={modal.isShown} key={modal.label}>
						{createElement(MODAL_STORE[modal.layer], modal.props)}
					</ModalLayer>
				))
			}
		</Fragment>
	);
};

const LayerContainer = memo(function LayerContainer({ isActive }: { isActive: boolean }) {

	const isAuthReady = useGlobal(global => global.auth_state == "ready");

	useEffect(() => APP_ENV == "development" ? () => {
		const { alert } = getDispatch();
		const { dev_disable_faloc } = getState(global => global.settings);
		!dev_disable_faloc && alert({
			label: "faloc",
			title: `Development Build ${APP_VERSION} (${window.buildInfo.gitHashShort})`,
			content: "Welcome to development build of TJMC-Launcher! This is the earliest beta version of UI, that maybe never goes to production builds.",
			type: "warn",
			buttons: [
				{
					name: "Cancel",
					closeOverlay: false,
					callback: () => void 0
				},
				{
					name: "Ок",
					class: ["filled", "colorBrand"],
					closeOverlay: true,
					callback: () => {
						console.debug("[dev]", "accepted!");
					}
				}
			],
			mini: true
		});
	} : undefined, []);

	useEffect(() => {
		const { openWhatsNewModal } = getDispatch();
		const showWhatsNew = getState(global => global.lastAppVersionId != APP_VERSION);
		showWhatsNew && isAuthReady && openWhatsNewModal();
	}, [isAuthReady]);

	return (
		<div className={buildClassName("layerContainer", isActive && "active")}>
			<Modals />
		</div>
	);
});

export default LayerContainer;
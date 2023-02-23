import { createElement, memo, useEffect, useState } from "react";

import useShowTransition from "Hooks/useShowTransition";
import captureKeyboardListeners from "Util/captureKeyboard";
import buildClassName from "Util/buildClassName";
import { getDispatch, getState } from "Util/Store";
import { SVG } from "./svg";

import Settings from "./Modals/Settings";
import VersionChooser from "./Modals/VersionChooser";
import Alert from "./Modals/Alert";

import style from "CSS/modal.module.css";
import WhatsNew from "./Modals/WhatsNew";
import useGlobal from "Hooks/useGlobal";

const MODAL_STORE = {
	settings: Settings,
	versionChooser: VersionChooser,
	alert: Alert,
	"whats-new": WhatsNew,
};

const ModalLayer = ({ isShown, children }) => {

	const { closeModal, onHideModal } = getDispatch();

	const params = Object.assign({}, {
		closeButton: true,
		allowOutsideClick: true,
		label: "layer-0", // if this appears -> thats a bug
	}, children.props);

	const [isModalOpen, setModalOpen] = useState(false);

	useEffect(() => {
		setModalOpen(isShown);
	}, [isShown, setModalOpen]); // used for show transitions

	const onCloseEnd = () => onHideModal(params.label);

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
				<div className={style.closeButton} onclick={closeModal}>{SVG("cross")}</div>
				<div className={style.keyCode}>{"ESC"}</div>
			</div>
		);
	};

	return (
		<div className={buildClassName(style.layer, transitionClassNames)}>
			<div className={buildClassName(style.backdrop)} layer-id={params.label} onClick={params.allowOutsideClick && closeModal} />
			{params.closeButton && createToolsContainer(closeModal)}
			{children}
		</div>
	);

};

const Modals = memo(() => {

	const { closeModal } = getDispatch();
	const { modals } = useGlobal(global => ({ modals: global.modals }));

	const isOpen = modals.length > 0;

	useEffect(() => (isOpen ? captureKeyboardListeners({ onEsc: closeModal }) : undefined), [isOpen, closeModal]);

	return isOpen &&
		modals.map((modal) =>
			<ModalLayer isShown={modal.isShown} key={modal.label}>
				{createElement(MODAL_STORE[modal.layer], modal.props)}
			</ModalLayer>
		);
});

const LayerContainer = memo(() => {

	useEffect(() => {
		const { alert } = getDispatch();
		const { dev_disable_faloc } = getState(global => global.settings);
		APP_ENV == "development" && !dev_disable_faloc && alert({
			title: `Development Build ${APP_VERSION} (${window.buildInfo.gitHashShort})`,
			content: createElement("span", null, "Welcome to development build of TJMC-Launcher! This is the earliest beta version of UI, that maybe never goes to production builds. If you want to use stable build\xa0", createElement("a", { href: "https://app.tjmcraft.ga/" }, "click here"), "\xa0please."),
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
	}, []);

	return (
		<div className={buildClassName("layerContainer")}>
			<Modals />
		</div>
	);
});

export default LayerContainer;
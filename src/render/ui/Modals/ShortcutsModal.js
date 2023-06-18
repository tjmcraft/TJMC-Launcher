import { memo, createElement, useState, useMemo } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Store/Global";
import useGlobal from "Hooks/useGlobal";

import { Modal, ModalFooter } from ".";


const ShortcutsModal = (props) => {
	const { closeModal } = getDispatch();
	return (
		<Modal mini={true} small={true} full={false}>
			<div className={buildClassName("container", "left-closed")} id="version-selector">
				<div className="middleColumn">
					<h1>Hello world!</h1>
				</div>
			</div>
		</Modal>
	);
};

export default memo(ShortcutsModal);
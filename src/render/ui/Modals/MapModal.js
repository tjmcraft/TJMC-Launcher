import { createElement, memo, Fragment } from "react";
import { Modal } from ".";
import buildClassName from "Util/buildClassName";
import { getDispatch } from "Store/Global";

const MapContainer = memo(() => {
	const { closeModal } = getDispatch();
	return (
		<div className={buildClassName("main-content")} style={{padding: '0px' }}>
			<iframe src="https://map.tjmc.ru" seamless={true} onError={() => closeModal()} style={{borderRadius: '0px'}} />
		</div>
	);
})

const MapModal = memo(() => {
	return (
		<Modal mini={false} small={false} full={false}>
			<MapContainer />
		</Modal>
	);
});

export default MapModal;
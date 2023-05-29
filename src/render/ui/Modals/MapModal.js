import { createElement, memo, useRef, useEffect, useCallback, useState } from "react";
import { Modal } from ".";
import buildClassName from "Util/buildClassName";
import { getDispatch } from "Store/Global";
import Spinner from "UI/components/Spinner";

const MapContainer = memo(() => {
	const { closeModal } = getDispatch();
	const [loadError, setLoadError] = useState(false);
	const timer = useRef(undefined);
	const handleLoad = useCallback(() => {
		// clearTimeout(timer.current);
	}, []);
	useEffect(() => {
		timer.current = setTimeout(() => {
			setLoadError(true);
		}, 5000);
		return () => clearTimeout(timer.current);
	}, []);
	return (
		<div className={buildClassName("main-content", "d-flex", "vertical", "centred")} style={{ padding: '0px' }}>
			<Spinner color={'blue'} size={2} />
			<h3 style={{ marginTop: '8px', ...(loadError ? {} : {opacity: 0}) }}>Loading took a while...</h3>
			<iframe src="https://map.tjmc.ru" seamless={true} onLoad={handleLoad} style={{ borderRadius: '0px' }} />
		</div>
	);
});

const MapModal = memo(() => {
	return (
		<Modal mini={false} small={false} full={false}>
			<MapContainer />
		</Modal>
	);
});

export default MapModal;
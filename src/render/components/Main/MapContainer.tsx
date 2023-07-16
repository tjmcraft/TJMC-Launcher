import { createElement, memo, useRef, useEffect, useCallback, useState } from "react";
import buildClassName from "Util/buildClassName";

import Spinner from "UI/Spinner";

const MapContainer = memo(() => {
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

export default memo(MapContainer);
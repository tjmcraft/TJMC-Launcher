import React, { memo, createElement, useMemo } from "react";
import CubeTopToolbar from "./CubeTopToolbar";
import useColorTheme from "Hooks/useColorTheme";

const CubeTopContainer = ({ hash }: { hash: string }) => {
	const theme = useColorTheme();
	const wallpapers = useMemo(() => ({
		dark: require('IMG/wallpapers/shapes-dark.png'),
		light: require('IMG/wallpapers/shapes-light.png'),
	}), []);
	return (
		<div className="top">
			<img src={wallpapers[theme] || require('IMG/1042-1920x1080.jpg')} />
			<div className="top-overlay">
				<CubeTopToolbar hash={hash} />
			</div>
		</div>
	);
};

export default memo(CubeTopContainer);
import { createElement, Fragment, memo } from "react";
import buildClassName from "Util/buildClassName";

import MainSVG from 'SVG/main.svg';
import FirstSVG from 'SVG/first.svg';
import SecondSVG from 'SVG/second.svg';

import appStyle from "CSS/app.module.css";


const MainScreen = memo(() => (
	<div className={buildClassName("main-content", "auto-s")}>
		<div className={buildClassName("pageWrapper")}>
			<div className="viewWrapper">
				<div className="header-q">
					<img className="headerImage" src={MainSVG} />
					<div className="headerContentWrapper">
						<div className="headerContent">
							<h2 className={buildClassName('title', 'sizeZ', appStyle.base)}>{"ТюменьCraft"}</h2>
							<h3 className={buildClassName('subtitle', 'sizeQ', appStyle.base)}>{"Любите девушки, простых романтиков, отважных лётчиков и моряков..."}</h3>
						</div>
					</div>
				</div>
				<div className="main-q">
					<div className="section">
						<div className={buildClassName("grid-q")}>
							<div className={buildClassName('row-q', 'imageLeft', 'container-z')}>
								<img className={buildClassName('featureImage', 'lim')} src={FirstSVG} />
								<div className="description">
									<h2>{"This is image left box"}</h2>
									<div className={buildClassName('subtitle', 'sizeQ')}>{"Subtitle text for grid box. It can be longer and longer... But now it`s not"}</div>
								</div>
							</div>
						</div>
						<div className={buildClassName("grid-q", "grayBackground")}>
							<div className={buildClassName('row-q', 'imageRight', 'container-z')}>
								<img className={buildClassName('featureImage', 'lim')} src={FirstSVG} />
								<div className="description">
									<h2>{"This is image right box"}</h2>
									<div className={buildClassName('subtitle', 'sizeQ')}>{"Subtitle text for grid box. It can be longer and longer... But now it`s not"}</div>
								</div>
							</div>
						</div>
						<div className={buildClassName("grid-q")}>
							<div className={buildClassName('row-q', 'imageBottom', 'container-z')}>
								<img className={buildClassName('featureImage', 'lim')} src={SecondSVG} />
								<div className="description">
									<h2>{"This is image bottom box"}</h2>
									<div className={buildClassName('subtitle', 'sizeQ')}>{"Subtitle text for grid box. It can be longer and longer... But now it`s not"}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="footer-q">
					{"footer\nfooter?\nа нахуй он вообще нужен?"}
				</div>
			</div>
		</div>
	</div>
));

const NewsScreen = memo(() => (
	<div className={buildClassName("main-content", "d-flex", "centred", "auto-s")}>
		<h1>News will be here</h1>
		<h3>but maybe later</h3>
	</div>
));

const MapScreen = memo(() => (
	<div className={buildClassName("main-content", "no-scroll")}>
		<iframe src="https://map.tjmc.ru" seamless={true} />
	</div>
));

const MainContent = ({ currentScreen }) => {
	switch (currentScreen) {
		case "main":
			return <MainScreen />;
		case "news":
			return <NewsScreen />;
		case "map":
			return <MapScreen />;
		default:
			return <h5>Loading...</h5>;
	}
};

export default memo(MainContent);
import { createElement, Fragment, memo } from "react";
import buildClassName from "Util/buildClassName";

import MainSVG from 'SVG/main.svg';
import FirstSVG from 'SVG/first.svg';
import SecondSVG from 'SVG/second.svg';

import appStyle from "CSS/app.module.css";


const MainScreen = memo(() => {
	return (
		<div className={buildClassName("main-content")}>
			{createElement('div', { class: buildClassName('pageWrapper', 'auto-s') },

				createElement('div', { class: 'viewWrapper' },
					createElement('div', { class: 'header-q' },
						createElement('img', {
							class: 'headerImage',
							src: MainSVG
						}),
						createElement('div', { class: 'headerContentWrapper' },
							createElement('div', { class: 'headerContent' },
								createElement('h2', { class: buildClassName('title', 'sizeZ', appStyle.base) }, 'ТюменьCraft'),
								createElement('h3', { class: buildClassName('subtitle', 'sizeQ', appStyle.base) }, 'Любите девушки, простых романтиков, отважных лётчиков и моряков...')
							)
						)
					),
					createElement('div', { class: 'main-q' },
						createElement('div', { class: 'section' },
							createElement('div', { class: 'grid-q' },
								createElement('div', { class: buildClassName('row-q', 'imageLeft', 'container-z') },
									createElement('img', {
										class: buildClassName('featureImage', 'lim'),
										src: FirstSVG
									}),
									createElement('div', { class: 'description' },
										createElement('h2', null, 'This is image left box'),
										createElement('div', { class: buildClassName('subtitle', 'sizeQ') }, 'Subtitle text for grid box. It can be longer and longer... But now it`s not'),
									)
								)
							),
							createElement('div', { class: buildClassName('grid-q', 'grayBackground') },
								createElement('div', { class: buildClassName('row-q', 'imageRight', 'container-z') },
									createElement('img', {
										class: buildClassName('featureImage', 'lim'),
										src: FirstSVG
									}),
									createElement('div', { class: ['description'] },
										createElement('h2', null, 'This is image right box'),
										createElement('div', { class: ['subtitle', 'sizeQ'] }, 'Subtitle text for grid box. It can be longer and longer... But now it`s not'),
									)
								)
							),
							createElement('div', { class: 'grid-q' },
								createElement('div', { class: buildClassName('row-q', 'imageBottom', 'container-z') },
									createElement('div', { class: 'description' },
										createElement('h2', null, 'This is image bottom box'),
										createElement('div', { class: buildClassName('subtitle', 'sizeQ') }, 'Subtitle text for grid box. It can be longer and longer... But now it`s not'),
									),
									createElement('img', {
										class: 'featureImage',
										src: SecondSVG
									})
								)
							)
						)
					),
					createElement('div', { class: 'footer-q' }, "footer\nfooter?\nа нахуй он вообще нужен?"),
				)

			)}
		</div>);
});

const NewsScreen = memo(() => (
	<div className={buildClassName("main-content", "d-flex", "centred", "auto-s")}>
		<h1>News will be here</h1>
		<h3>but maybe later</h3>
	</div>
));

const MapScreen = memo(() => (
	<div className={buildClassName("main-content")}>
		<iframe src="https://map.tjmcraft.ga" seamless={true} />
	</div>
));

const ActiveScreen = ({ currentScreen }) => {
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

const MainContent = ({ currentScreen }) => {
	return (
		<ActiveScreen currentScreen={currentScreen} />
	);
};

export default memo(MainContent);
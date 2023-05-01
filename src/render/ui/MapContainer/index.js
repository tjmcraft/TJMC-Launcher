import MainSidebar from "UI/MainSidebar";
import buildClassName from "Util/buildClassName";
import { createElement, memo } from "react";

const MapContainer = () => {
	return (
		<div className="base" id="cube">
			<div className="content">
				<MainSidebar>
					<div className={buildClassName('scroller', 'thin-s')}>
						<h2 className={buildClassName('headerDiscover', 'size24')}>{"Главная"}</h2>
						<div className={buildClassName('categoryItem')}>
							<div className="innerItem">
								<div className="avatar"></div>
								<div className="content"></div>
							</div>
						</div>
					</div>
				</MainSidebar>
				<div className={buildClassName("main-content", "no-scroll")}>
					<iframe src="https://map.tjmc.ru" seamless={true} />
				</div>
			</div>
		</div>
	);
};

export default memo(MapContainer);
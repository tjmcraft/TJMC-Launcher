import { createElement, useCallback, useRef, memo, useEffect } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Store/Global";

import useContextMenu from "Hooks/useContextMenu";
import useContextMenuPosition from "Hooks/useContextMenuPosition";
import { selectInstallation } from "Model/Selectors/installations";
import useHostOnline from "Hooks/useHostOnline";
import useGlobal from "Hooks/useGlobal";
import useGlobalProgress from "Hooks/useGlobalProgress";

import PendingProgress from "UI/components/PendingProgress";
import RoundProgress from "UI/components/RoundProgress";
import Menu from "UI/components/Menu";
import MenuItem from "UI/components/MenuItem";
import Portal from "UI/components/Portal";



const StatusContainer = ({ hash, isProcessing }) => {
	const { progress } = useGlobalProgress(global => {
		const version = global[hash] || {};
		return {
			progress: version.progress || 0,
		};
	}, [hash]);
	return createElement('div', { class: 'status-container' },
		isProcessing ? (
			progress > 0 ?
				createElement(RoundProgress, { progress: progress * 100 }) :
				createElement(PendingProgress)
		) : null);
};

const CubeSidebarItem = ({ hash, isSelected }) => {

	const {
		setVersionHash,
		invokeLaunch,
		revokeLaunch,
		alert,
		removeInstallation
	} = getDispatch();

	const { name, type, isProcessing } = useGlobal(global => {
		const version = selectInstallation(global, hash);
		return {
			name: version.name,
			type: version.type,
			isProcessing: version.isProcessing,
		};
	}, [hash]);

	const containerRef = useRef();

	const {
		isContextMenuOpen, contextMenuPosition,
		handleContextMenu,
		handleContextMenuClose, handleContextMenuHide,
	} = useContextMenu(containerRef, false);

	const getRootElement = useCallback(() => containerRef.current.closest('.scroller'), []);
	const getMenuElement = useCallback(() => undefined, []);

	const {
		positionX, positionY, style: menuStyle, transformOriginX, transformOriginY,
	} = useContextMenuPosition(contextMenuPosition,
		getRootElement,
		getMenuElement);

	const handleClick = useCallback(() => setVersionHash(hash), [hash, setVersionHash]);

	const handleLaunchClick = useCallback((e) => (!isProcessing ?
		invokeLaunch({ hash }) : revokeLaunch({ hash })
	), [hash, invokeLaunch, revokeLaunch, isProcessing]);

	const handleRemoveClick = useCallback((e) => {
		alert({
			title: "Удаление установки",
			content: `Вы действительно хотите удалить установку "${name}" с вашего компьютера?`,
			type: "error",
			buttons: [
				{
					name: "Отмена",
					closeOverlay: true,
				},
				{
					name: "Удалить",
					class: ["colorRed"],
					closeOverlay: true,
					callback: () => {
						removeInstallation({ hash, forceDeps: true });
					}
				},
				{
					name: "Стереть",
					class: ["filled", "colorRed"],
					closeOverlay: true,
					callback: () => {
						removeInstallation({ hash });
					}
				}
			],
			mini: true,
		});
	}, [alert, name, removeInstallation, hash]);

	return hash && (
		createElement(
			'div', {
				ref: containerRef,
				class: buildClassName('item', 'navItem', isSelected && "selected", isProcessing && "processing"),
				'version-hash': hash,
				onClick: handleClick,
				onContextMenu: handleContextMenu,
			},
			createElement('span', null, name || hash),
			createElement(StatusContainer, { isProcessing: isProcessing, hash: hash }),
			contextMenuPosition != undefined && (
				<Portal>
					<Menu
						isOpen={isContextMenuOpen}
						onClose={handleContextMenuClose}
						onCloseEnd={handleContextMenuHide}
						style={menuStyle}
						positionX={positionX} positionY={positionY}
						transformOriginX={transformOriginX} transformOriginY={transformOriginY}
					>
						<MenuItem compact onClick={handleClick}>
							<span className="">{'Выбрать'}</span>
						</MenuItem>
						<MenuItem compact onClick={handleLaunchClick}>
							<span className="">{!isProcessing ? 'Запустить' : 'Остановить'}</span>
						</MenuItem>
						<MenuItem compact onClick={handleRemoveClick} disabled={isProcessing}>
							<span className="color-red">{'Удалить'}</span>
						</MenuItem>
					</Menu>
				</Portal>
			)
		)
	);
};

export default memo(CubeSidebarItem);
import { createElement, useCallback, useRef, memo } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Util/Store";

import useContextMenu from "Hooks/useContextMenu";
import useContextMenuPosition from "Hooks/useContextMenuPosition";
import { selectInstallation } from "Model/Selectors/installations";

import PendingProgress from "UI/components/PendingProgress";
import RoundProgress from "UI/components/RoundProgress";
import Menu from "UI/components/Menu";
import MenuItem from "UI/components/MenuItem";
import useHostOnline from "Hooks/useHostOnline";
import useGlobal from "Hooks/useGlobal";


const CubeSidebarItem = memo(({ hash, isSelected }) => {

	const { setVersionHash, invokeLaunch, alert, removeInstallation } = getDispatch();

	const hostOnline = useHostOnline();
	const { name, type, progress, isProcessing } = useGlobal(global => {
		const version = selectInstallation(global, hash);
		return {
			name: version.name,
			type: version.type,
			progress: version.progress,
			isProcessing: version.isProcessing,
		};
	}, [hash]);

	const containerRef = useRef();

	const {
		isContextMenuOpen, contextMenuPosition,
		handleContextMenu,
		handleContextMenuClose, handleContextMenuHide,
	} = useContextMenu(containerRef, false);

	const getTriggerElement = useCallback(() => containerRef.current, []);

	const getRootElement = useCallback(() => containerRef.current.closest('.scroller'),
		[]);

	const getMenuElement = useCallback(() => undefined,
		[]);

	const {
		positionX, positionY, style: menuStyle,
	} = useContextMenuPosition(contextMenuPosition,
		getTriggerElement,
		getRootElement,
		getMenuElement,);

	const handleClick = useCallback(() => {
		setVersionHash(hash);
	}, [hash, setVersionHash]);

	const handleLaunchClick = useCallback((e) => {
		hostOnline && invokeLaunch({ hash });
	}, [hash, invokeLaunch, hostOnline]);

	const handleRemoveClick = useCallback((e) => {
		alert({
			title: "Удаление версии",
			content: `Вы дествительно хотите удалить установку "${name}" с вашего компьютера?`,
			type: "error",
			buttons: [
				{
					name: "Отмена",
					closeOverlay: true,
				},
				{
					name: "Удалить",
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

	/* useEffect(() => {
		console.debug(">>RC", isContextMenuOpen, contextMenuPosition);
	}, [isContextMenuOpen, contextMenuPosition]); */

	return hash && (
		createElement(
			'div', {
				ref: containerRef,
				class: buildClassName('item', 'navItem', isSelected && "selected"),
				'version-hash': hash,
				onClick: handleClick,
				onContextMenu: handleContextMenu,
			},

			createElement('span', null, name || hash),
			createElement('div', { class: 'status-container' },
				isProcessing ? (
					progress > 0 ?
						createElement(RoundProgress, { progress: progress * 100 }) :
						createElement(PendingProgress)
				) : null),
			contextMenuPosition != undefined && createElement(
				Menu, {
					isOpen: isContextMenuOpen,
					onClose: handleContextMenuClose,
					onCloseEnd: handleContextMenuHide,
					style: menuStyle,
					positionX, positionY,

				},
				<MenuItem compact onClick={handleClick}>Select</MenuItem>,
				<MenuItem compact onClick={handleLaunchClick}>Launch</MenuItem>,
				<MenuItem compact onClick={handleRemoveClick}><span className="color-red">Remove</span></MenuItem>,
			)
		)
	);
});

export default CubeSidebarItem;
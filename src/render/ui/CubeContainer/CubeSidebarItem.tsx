import { createElement, useCallback, useRef, memo, FC } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Store/Global";

import useContextMenu from "Hooks/useContextMenu";
import useContextMenuPosition from "Hooks/useContextMenuPosition";
import { selectInstallation } from "Model/Selectors/installations";
import useGlobal from "Hooks/useGlobal";
import useGlobalProgress from "Hooks/useGlobalProgress";

import PendingProgress from "UI/components/PendingProgress";
import RoundProgress from "UI/components/RoundProgress";
import Menu from "UI/components/Menu";
import MenuItem from "UI/components/MenuItem";
import Portal from "UI/components/Portal";


const StatusContainer = ( { hash, isProcessing } ) => {
	// @ts-ignore
	const { progress } = useGlobalProgress(global => {
		const version = global[hash] || {};
		return {
			progress: version.totalProgress || 0,
		};
	}, [hash]);
	return (
		<div className="status-container">
			{isProcessing && (
				progress > 0 ?
					<RoundProgress progress={progress * 100} /> :
					<PendingProgress />
			)}
		</div>
	);
};

type OwnProps = {
	containerRef?: React.RefObject<HTMLElement>;
	isProcessing?: boolean;
	isContextMenuOpen?: boolean;
	contextMenuPosition?: any;
	handleContextMenuClose?: AnyFunction;
	handleContextMenuHide?: AnyFunction;
	hash?: string;
	name?: string;
	handleClick: AnyFunction;
}

const ContextMenu: FC<OwnProps> = ({
	containerRef,
	isProcessing,
	isContextMenuOpen,
	contextMenuPosition,
	handleContextMenuClose,
	handleContextMenuHide,
	hash,
	name,
	handleClick,
}) => {

	const {
		invokeLaunch,
		revokeLaunch,
		alert,
		removeInstallation,
		openInstallationEditor,
		openInstallationFolder,
	} = getDispatch();

	const menuRef = useRef();

	const getTriggerElement = useCallback(() => containerRef.current, [containerRef]);
	const getRootElement = useCallback(() => containerRef.current.closest('.scroller'), [containerRef]);
	const getMenuElement = useCallback(() => menuRef.current, []);

	const {
		positionX, positionY, style: menuStyle, transformOriginX, transformOriginY,
	} = useContextMenuPosition(contextMenuPosition,
		getTriggerElement,
		getRootElement,
		getMenuElement, () => ({ withPortal: true }));

	const handleLaunchClick = useCallback(() => (!isProcessing ?
		invokeLaunch({ hash }) : revokeLaunch({ hash })
	), [hash, invokeLaunch, revokeLaunch, isProcessing]);

	const handleRemoveClick = useCallback(() => {
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

	const handleEditClick = useCallback(() => openInstallationEditor({ hash }), [openInstallationEditor, hash]);
	const handleOpenFolderClick = useCallback(() => openInstallationFolder({ hash }), [openInstallationFolder, hash]);

	return contextMenuPosition != undefined && (
		<Portal>
			<Menu
				ref={menuRef}
				isOpen={isContextMenuOpen}
				onClose={handleContextMenuClose}
				onCloseEnd={handleContextMenuHide}
				style={menuStyle}
				positionX={positionX} positionY={positionY}
				transformOriginX={transformOriginX} transformOriginY={transformOriginY}
			>
				<MenuItem compact onClick={handleLaunchClick}>
					<i className={!isProcessing ? "icon-play" : "icon-stop"} />
					{!isProcessing ? 'Запустить' : 'Остановить'}
				</MenuItem>
				<MenuItem compact onClick={handleEditClick}>
					<i className="icon-edit" />
					{'Редактировать'}
				</MenuItem>
				<MenuItem compact onClick={handleOpenFolderClick}>
					<i className="icon-folder" />
					{'Открыть папку'}
				</MenuItem>
				<MenuItem compact onClick={handleClick}>
					<i className="icon-select" />
					{'Выбрать'}
				</MenuItem>
				<MenuItem compact destructive onClick={handleRemoveClick} disabled={isProcessing}>
					<i className="icon-delete" />
					{'Удалить'}
				</MenuItem>
			</Menu>
		</Portal>
	);
};

const CubeSidebarItem = ({
	hash,
	isSelected = false,
	isDragOver = false,
	onDragStart = undefined,
	onDragEnter = undefined,
	onDragLeave = undefined,
	onDragExit = undefined,
	onDragOver = undefined,
	onDragEnd = undefined,
	onDrop = undefined,
}) => {

	const { setVersionHash } = getDispatch();

	const { name, isProcessing } = useGlobal(global => {
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

	const handleClick = useCallback(() => setVersionHash(hash), [hash, setVersionHash]);

	const fullClassName = buildClassName(
		'item',
		'navItem',
		isSelected && "selected",
		isProcessing && "processing",
		isDragOver && "dragOver",
	);

	return hash && (
		<div
			ref={containerRef}
			version-hash={hash}
			className={fullClassName}
			onClick={handleClick}
			onContextMenu={handleContextMenu}
			draggable={true}
			onDragStart={onDragStart}
			onDragEnter={onDragEnter}
			onDragLeave={onDragLeave}
			onDragExit={onDragExit}
			onDragOver={onDragOver}
			onDragEnd={onDragEnd}
			onDrop={onDrop}
		>
			<span>{name || hash}</span>
			<StatusContainer isProcessing={isProcessing} hash={hash} />
			<ContextMenu
				containerRef={containerRef}
				isContextMenuOpen={isContextMenuOpen}
				isProcessing={isProcessing}
				contextMenuPosition={contextMenuPosition}
				handleContextMenuClose={handleContextMenuClose}
				handleContextMenuHide={handleContextMenuHide}
				handleClick={handleClick}
				hash={hash} name={name}
			/>
		</div>
	);
};

export default memo(CubeSidebarItem);
import { useCallback, useState } from "react";

const useContextMenu = (
	elementRef,
	isMenuDisabled = false,
	shouldDisableOnLink = false,
	shouldDisableOnLongTap = false,
) => {
	const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
	const [contextMenuPosition, setContextMenuPosition] = useState(undefined);

	elementRef &&
	shouldDisableOnLongTap;

	const handleContextMenu = useCallback((e) => {
		(e.target).classList.remove('no-selection');

		if (isMenuDisabled || (shouldDisableOnLink && (e.target).matches('a[href]'))) {
			return;
		}
		e.preventDefault();

		if (contextMenuPosition) {
			return;
		}

		setIsContextMenuOpen(true);
		setContextMenuPosition({ x: e.clientX, y: e.clientY });
	}, [isMenuDisabled, shouldDisableOnLink, contextMenuPosition]);

	const handleContextMenuClose = useCallback(() => {
		setIsContextMenuOpen(false);
	}, []);

	const handleContextMenuHide = useCallback(() => {
		setContextMenuPosition(undefined);
	}, []);

	return {
		isContextMenuOpen,
		contextMenuPosition,
		handleContextMenu,
		handleContextMenuClose,
		handleContextMenuHide,
	};
};

export default useContextMenu;
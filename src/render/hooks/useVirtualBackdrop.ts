import { useEffect } from "react";

const BACKDROP_CLASSNAME = 'backdrop';

const useVirtualBackdrop = (isOpen, menuRef, onClose) => {
	useEffect(() => {
		const handleEvent = (e) => {
			const menu = menuRef.current;
			const target = e.target;
			if (!menu || !target) {
				return;
			}

			if (
				!menu.contains(e.target)
        || target.classList.contains(BACKDROP_CLASSNAME)
			) {
				e.preventDefault();
				e.stopPropagation();
				if (onClose) {
					onClose();
				}
			}
		};

		if (isOpen && onClose) {
			document.addEventListener('mousedown', handleEvent);
		}

		return () => {
			document.removeEventListener('mousedown', handleEvent);
		};
	}, [isOpen, menuRef, onClose]);
};

export default useVirtualBackdrop;
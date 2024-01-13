import React, { createElement, memo, useCallback, useEffect, useRef, useState } from "react";
import useVirtualBackdrop from "Hooks/useVirtualBackdrop";
import buildClassName from "Util/buildClassName";
import captureEscKeyListener from "Util/captureEscKeyListener";

import style from "./index.module.css";
import useShowTransition from "Hooks/useShowTransition";

const DropdownSelector = ({
	title = "Dropdown",
	items = [],
	onSelect = void 0
}: {
	title?: string;
	items: VersionTypes;
	onSelect: AnyToVoidFunction;
}) => {

	const [isOpen, setOpen] = useState(false);
	const [selected, select] = useState(undefined);
	const menuRef = useRef();

	const { transitionClassNames, hasOpenClass } = useShowTransition(isOpen, undefined, false, undefined, false, undefined, 200);

	const handleClick = useCallback((e) => {
		e.preventDefault();
		setOpen((state) => !state);
	}, [setOpen]);

	const onClose = useCallback(() => {
		setOpen(false);
	}, [setOpen]);

	const handleSelect = (item) => {
		return (e) => {
			e.stopPropagation();
			if (hasOpenClass) {
				select(item);
				setOpen(false);
				if (typeof onSelect === 'function') onSelect(item);
			}
		};
	};

	useEffect(() => (isOpen ? captureEscKeyListener(onClose) : undefined), [isOpen, onClose]);
	useVirtualBackdrop(isOpen, menuRef, onClose);

	return (
		<div className={style.dropContainer}  ref={menuRef}>
			<div className={style.header} onClick={handleClick}>
				<h1>{selected ? selected.name : title}</h1>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" className={buildClassName("button-1w5pas", isOpen && "open")}>
					<g fill="none" fillRule="evenodd">
						<path d="M0 0h18v18H0" />
						<path stroke="currentColor" d="M4.5 4.5l9 9" strokeLinecap="round" />
						<path stroke="currentColor" d="M13.5 4.5l-9 9" strokeLinecap="round" />
					</g>
				</svg>
			</div>
			<div className={buildClassName(style.dropdown, transitionClassNames)}>
				{items && items.map(item => createElement('span', { onClick: handleSelect(item) }, item.name))}
			</div>
		</div>
	);
};
export default memo(DropdownSelector);
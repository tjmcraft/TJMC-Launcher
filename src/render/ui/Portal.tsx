import { FC, ReactNode } from "react";
import { createPortal } from "react-dom";

type OwnProps = {
	children: ReactNode;
};

const Portal: FC<OwnProps> = ({ children }) => {
	return createPortal(children, document.querySelector("#portals"));
};

export default Portal;
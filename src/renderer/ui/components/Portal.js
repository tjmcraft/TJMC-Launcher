import { createPortal } from "react-dom";

const Portal = ({ children }) => {
	return createPortal(children, document.querySelector("#portals"));
};

export default Portal;
const buildStyle = (styleObject: AnyLiteral = {}) => {
	if (Array.isArray(styleObject)) return;
	return Object.keys(styleObject).map(style => `${style}: ${styleObject[style]}`).join(";");
};

export { buildStyle };
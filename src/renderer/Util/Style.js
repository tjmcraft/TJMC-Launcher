const buildStyle = (styleObject = {}) => {
    if (!Array.isArray(styleObject))
        styleObject = Object.keys(styleObject)
            .map(style => `${style}: ${styleObject[style]}`)
    return styleObject.join(";");
}

export { buildStyle }
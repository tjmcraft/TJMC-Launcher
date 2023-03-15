const { shell, nativeImage } = require("electron");
const path = require('path');

exports.openDir = function (path) {
	shell.openPath(path);
}

exports.platformIcon = ((platform) => {
	let ext, filename;
	switch (platform) {
		case "win32":
			ext = "ico";
			filename = "icon";
			break;
		default:
			ext = "png";
			filename = "icon";
	}
	const iconPath = path.join(__dirname, '../..', 'icons', `${filename}.${ext}`);
	const image = nativeImage.createFromPath(iconPath);
	image.setTemplateImage(true);
	return image;
})(process.platform);
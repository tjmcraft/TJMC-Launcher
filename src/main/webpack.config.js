const path = require("path");

module.exports = {
	mode: 'development',
	entry: path.resolve(__dirname, 'index.js'),
	target: 'electron-main',
	devtool: "source-map",
	node: {
    __dirname: true
  },
	module: {
		rules: [
			{
				test: /\.(js|ts)$/,
				exclude: /node_modules/,
				include: /src/,
				use: [{
					loader: "ts-loader",
				}],
			},
			{
				test: /\.node$/,
				loader: "native-ext-loader"
			}
		]
	},
	resolve: {
		extensions: ['.js', '.ts']
	},
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'dist')
	},
};
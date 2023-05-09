
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const { DefinePlugin } = require("webpack");
const pkg = require('../../package.json');

const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;
console.debug("DEV MODE:", isDev);

const optimization = () => {
	const config = {
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all'
				}
			},
			chunks: 'all',
			minSize: 10000,
			maxSize: 250000
		}
	};

	if (isProd) {
		config.minimizer = [
			new TerserWebpackPlugin(),
		];
	}

	return config;
};

module.exports = {
	target: 'web',
	node: {
		global: true
	},
	entry: {
		main: path.resolve(__dirname, 'index.js')
	},
	resolve: {
		extensions: ['.js', '.jsx', '.json', '.css', '.png', '.*'],
		alias: {
			Libs: path.resolve(__dirname, 'Libs'),
			Util: path.resolve(__dirname, 'Util'),
			Store: path.resolve(__dirname, 'Store'),
			SVG: path.resolve(__dirname, 'assets', 'svg'),
			IMG: path.resolve(__dirname, 'assets', 'images'),
			CSS: path.resolve(__dirname, 'assets', 'css'),
			UI: path.resolve(__dirname, 'ui'),
			Model: path.resolve(__dirname, 'Model'),
			Hooks: path.resolve(__dirname, 'hooks'),
			react: "preact/compat",
			"react-dom/test-utils": "preact/test-utils",
			"react-dom": "preact/compat",
			"react/jsx-runtime": "preact/jsx-runtime"
		}
	},
	output: {
		path: path.resolve(__dirname, "../..", "compiled", "renderer"),
		filename: '[name].[contenthash].js',
		chunkFilename: '[id].[chunkhash].js',
		assetModuleFilename: '[name].[contenthash][ext]',
		clean: true,
	},
	mode: isDev ? "development" : "production",
	devtool: 'source-map',
	devServer: {
		historyApiFallback: true,
		compress: true,
		hot: isDev,
		liveReload: true,
		allowedHosts: "all",
		port: 3333
	},
	optimization: optimization(),
	performance: {
		maxAssetSize: 1000000
	},
	module: {
		rules: [
			{
				test: /\.(ts|jsx|js)$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
			},
			{
				test: /\.css$/,
				use: [
					...(isDev ? [{
						loader: 'style-loader',
						options: {}
					}] : [{
						loader: MiniCssExtractPlugin.loader,
						options: {
							//hmr: isDev,
							//reloadAll: true
						}
					}]),
					{
						loader: 'css-loader',
						options: {
							modules: {
								localIdentName: isDev ? "[name]__[local]-[hash:base64:6]" : "[local]-[hash:base64:6]",
							}
						}
					}
				],
				include: [/\.module\.css$/]
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					{
						loader: 'css-loader'
					},
				],
				exclude: [/\.module\.css$/]
			},
			{
				test: /\.(woff(2)?|ttf|eot|svg|png|jpg|tgs)(\?v=\d+\.\d+\.\d+)?$/,
				type: 'asset/resource'
			},
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].[contenthash].css',
			chunkFilename: '[name].[chunkhash].css',
			ignoreOrder: true,
		}),
		new HtmlWebpackPlugin({
			appName: "TJMC-Launcher",
			title: "TJMC-Launcher",
			favicon: path.resolve(__dirname, 'assets/images/icon.png'),
			inject: false,
			meta: {
				charset: { charset: 'UTF-8' },
				viewport: 'width=device-width, initial-scale=1, minimum-scale=1.0',
			},
			template: path.resolve(__dirname, 'index.html'),
			minify: {
				collapseWhitespace: isProd
			},
			scriptLoading: "defer"
		}),
		new DefinePlugin({
			APP_NAME: JSON.stringify(pkg['build']['productName']),
			APP_ENV: JSON.stringify(isDev ? "development" : "production"),
			APP_VERSION: JSON.stringify(pkg['version']),
			APP_COPYRIGHT: JSON.stringify(pkg['build']['copyright']),
			AUTHOR: JSON.stringify(pkg['author']),
			HTML_TIMESTAMP: JSON.stringify(Date.now()),
		}),
	],
};
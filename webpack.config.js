
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const PreactRefreshPlugin = require('@prefresh/webpack');
const webpack = require("webpack");
const pkg = require('./package.json');

const basePath = path.resolve(__dirname, 'src', 'render');

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
	entry: {
		main: path.resolve(basePath, 'index.tsx')
	},
	resolve: {
		extensions: ['.tsx', '.jsx', '.ts', '.js', '.json', '.css', '.png', '.*'],
		alias: {
			Libs: path.resolve(basePath, 'Libs'),
			Util: path.resolve(basePath, 'Util'),
			Store: path.resolve(basePath, 'Store'),
			SVG: path.resolve(basePath, 'assets', 'svg'),
			IMG: path.resolve(basePath, 'assets', 'images'),
			CSS: path.resolve(basePath, 'assets', 'css'),
			UI: path.resolve(basePath, 'ui'),
			Components: path.resolve(basePath, 'components'),
			Model: path.resolve(basePath, 'Model'),
			Hooks: path.resolve(basePath, 'hooks'),
			react: "preact/compat",
			"react-dom/test-utils": "preact/test-utils",
			"react-dom": "preact/compat",
			"react/jsx-runtime": "preact/jsx-runtime"
		}
	},
	output: {
		path: path.resolve(basePath, "dist"),
		filename: '[name].[contenthash].js',
		chunkFilename: '[id].[chunkhash].js',
		assetModuleFilename: '[name].[contenthash][ext]',
		clean: true,
	},
	mode: isDev ? "development" : "production",
	devtool: 'source-map',
	devServer: {
		port: 3333,
		hot: true,
	},
	optimization: optimization(),
	performance: {
		maxAssetSize: 1000000
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
			},
			{
				test: /\.(ts|tsx)$/,
				exclude: /node_modules/,
				loader: 'ts-loader',
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
			filename: isDev ? '[name].css' : '[name].[contenthash].css',
			chunkFilename: '[name].[chunkhash].css',
			ignoreOrder: true,
		}),
		new HtmlWebpackPlugin({
			appName: "TJMC-Launcher",
			title: "TJMC-Launcher",
			favicon: path.resolve(basePath, 'assets/images/icon.png'),
			inject: false,
			meta: {
				charset: { charset: 'UTF-8' },
				viewport: 'width=device-width, initial-scale=1, minimum-scale=1.0',
			},
			template: path.resolve(basePath, 'index.html'),
			minify: {
				collapseWhitespace: isProd
			},
			scriptLoading: "defer"
		}),
		new webpack.DefinePlugin({
			APP_NAME: JSON.stringify(pkg['build']['productName']),
			APP_ENV: JSON.stringify(isDev ? "development" : "production"),
			APP_VERSION: JSON.stringify(pkg['version']),
			APP_COPYRIGHT: JSON.stringify(pkg['build']['copyright']),
			AUTHOR: JSON.stringify(pkg['author']),
			HTML_TIMESTAMP: JSON.stringify(Date.now()),
		}),
		...(isDev ? [
			new webpack.HotModuleReplacementPlugin(),
			new PreactRefreshPlugin(),
		] : [])
	],
};
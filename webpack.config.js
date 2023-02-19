
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const { DefinePlugin } = require("webpack");
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

const filename = (ext) => `assets/${isDev ? `[name].${ext}` : `[contenthash].${ext}`}`;

module.exports = {
	entry: {
		main: ['@babel/polyfill', path.resolve(basePath, 'index.js')]
	},
	resolve: {
		extensions: ['.js', '.jsx', '.json', '.css', '.png', '.*'],
		alias: {
			Libs: path.resolve(basePath, 'Libs'),
			Util: path.resolve(basePath, 'Util'),
			SVG: path.resolve(basePath, 'assets', 'svg'),
			IMG: path.resolve(basePath, 'assets', 'images'),
			CSS: path.resolve(basePath, 'assets', 'css'),
			UI: path.resolve(basePath, 'ui'),
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
		filename: filename("js"),
		chunkFilename: filename("js"),
		assetModuleFilename: 'assets/[hash][ext][query]',
		publicPath: './',
		clean: true,
	},
	mode: isDev ? "development" : "production",
	devtool: isDev ? 'source-map' : false,
	// target: 'electron-renderer',
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
				test: /\.svg$/,
				use: [
					{
						loader: 'svg-url-loader',
						options: {
							limit: 10000,
							name: '[hash].[ext]',
							outputPath: 'assets/svg/'
						},
					}
				],
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
				test: /\.(js)$/,
				exclude: /node_modules/,
				use: [{
					loader: 'babel-loader',
					options: {
						presets: [
							'@babel/preset-env'
						],
						plugins: [
							'@babel/plugin-proposal-class-properties',
							'@babel/plugin-syntax-dynamic-import',
							"@babel/plugin-proposal-export-namespace-from",
							"@babel/plugin-proposal-throw-expressions"
						]
					}
				}]
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[hash].[ext]',
							outputPath: 'assets/fonts/'
						}
					}
				],
				type: 'asset/resource'
			},
			{
				test: /\.(png|jpg|gif)$/,
				use: [{
					loader: 'file-loader',
					options: {
						name: '[hash].[ext]',
						outputPath: 'assets/images/'
					}
				}],
				//type: 'asset/resource',
			}
		]
	},

	plugins: [
		new MiniCssExtractPlugin({
			filename: filename("css"),
			chunkFilename: filename("css"),
		}),
		new HtmlWebpackPlugin({
			appName: "TJMC-Launcher",
			title: "TJMC-Launcher",
			favicon: path.resolve(basePath, 'assets/images/icon.png'),
			inject: false,
			meta: {
				charset: { charset: 'UTF-8' },
				viewport: 'width=device-width, initial-scale=1',
			},
			template: path.resolve(basePath, 'index.html'),
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
			API_URL: JSON.stringify(isDev ? "https://appdev.tjmcraft.ga" : "https://app.tjmcraft.ga"),
		}),
	],
};
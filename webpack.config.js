const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const distPath = path.resolve(__dirname, 'dist');

module.exports = {
	mode: 'development',
	devtool: 'inline-source-map',
	devServer: {
		contentBase: './dist'
	},
	entry: {
		app: './src/main-app.ts'
	},
	output: {
		filename: '[name].bundle.js',
		path: distPath,
		publicPath: '/'
	},
	plugins: [
		// clearn out the dist directory
		new CleanWebpackPlugin(),
		// create the index.html file with bundles automatically imported
		new HtmlWebpackPlugin({
			title: 'Phaser Tutorial'
		})
	],
	module: {
		rules: [
			// typescript
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			},
			// images
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: [
					'file-loader'
				]
			},
			// styles
			{
				test: /\.s?css$/,
				use: [
					'style-loader',
					'css-loader',
					'sass-loader'
				]
			}
		]
	},
	resolve: {
		extensions: [ '.ts', '.js', '.json' ]
	}
};

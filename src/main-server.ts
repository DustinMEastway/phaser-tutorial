const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const config = require('../webpack.config.js');

const server = express();
const port = 3000;

// tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
server.use(webpackDevMiddleware(webpack(config), {
	publicPath: config.output.publicPath
}));

server.use(express.static(`${__dirname}/assets`));

server.listen(port, () => {
	console.log(`Server listening on port ${port}!\n`);
});

// add livereload server
const livereload = require('livereload');
const livereloadServer = livereload.createServer({
	extraExts: [ 'scss', 'ts', 'tsx' ]
});
livereloadServer.watch(__dirname);

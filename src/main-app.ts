import './style.scss';

// live reloading
const url = (location.host || 'localhost').split(':')[0];
document.write(`<script src="http://${url}:35729/livereload.js?snipver=1"></script>`);

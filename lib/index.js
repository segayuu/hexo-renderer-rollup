'use strict';
/* global hexo */

const renderer = require('./renderer');

hexo.extend.renderer.register('js', 'js', renderer);
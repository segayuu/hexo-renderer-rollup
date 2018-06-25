'use strict';

const toAbsolutePath = require('./utils/toAbsolutePaths');
const { getRawConfigs } = require('./utils/getHexoConfigs');
const omit = require('lodash.omit');

/** @typedef {NodeJS.EventEmitter} Hexo */

/**
 * @param {string} target
 * @param {string|string[]} entrys
 */
const isEntry = (target, entrys) => {
  if (typeof entrys === 'string') {
    return entrys === target;
  }
  return entrys.includes(target);
};

const inputToAbsoluteFilter = (config, baseDir) => {
  if (!config.input) {
    return;
  }
  config.input = toAbsolutePath(config.input, baseDir);
};

const getMergeRollupConfigs = ctx => {
  const raw = getRawConfigs('rollup', ctx);

  const site = Object.assign({}, raw.site);
  const theme = Object.assign({}, raw.theme);
  const override = Object.assign({}, raw.override);

  inputToAbsoluteFilter(site, ctx.base_dir);
  inputToAbsoluteFilter(theme, ctx.theme_dir);
  inputToAbsoluteFilter(override, ctx.base_dir);

  return Object.assign({
    output: {
      format: 'esm'
    }
  }, site, theme, override, {
    onwarn(warning) {
      ctx.log.warning(warning);
    }
  });
};

/**
 * @param {string} path
 * @param {Hexo} ctx
 */
const getRollupConfig = (path, ctx) => {
  const config = getMergeRollupConfigs(ctx);

  if (!config.input || !isEntry(path, config.input)) {
    return null;
  }

  config.input = path;

  const { output } = config;

  const input = omit(config, 'output');
  return { input, output };
};

module.exports = getRollupConfig;

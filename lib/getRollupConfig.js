'use strict';

const toAbsolutePath = require('./utils/toAbsolutePaths');
const { getRawConfigs } = require('./utils/getHexoConfigs');

const cloneDeep = require('clone-deep');

/** @typedef {NodeJS.EventEmitter} Hexo */

/**
 * @param {string} target
 * @param {string|string[]} entrys
 */
const isEntry = (target, entrys) => {
  if (entrys == null || entrys.length < 1) {
    return false;
  }
  if (typeof entrys === 'string') {
    return entrys === target;
  }
  return entrys.includes(target);
};

const getCloneRawConfigs = (name, ctx) => {
  const { site, theme, override } = getRawConfigs(name, ctx);

  return {
    site: cloneDeep(site),
    theme: cloneDeep(theme),
    override: cloneDeep(override)
  };
};

/**
 * @param {object} obj
 * @param {string[]} keys
 */
function objectWithoutKeys(obj, keys) {
  return Object.keys(obj).reduce((newObject, key) => {
    if (!keys.includes(key)) newObject[key] = obj[key];
    return newObject;
  }, {});
}

const inputToAbsoluteFilter = (config, baseDir) => {
  if (config.input) {
    config.input = toAbsolutePath(config.input, baseDir);
  }
};

const getMergeRollupConfigs = ctx => {
  const { site, theme, override } = getCloneRawConfigs('rollup', ctx);

  inputToAbsoluteFilter(site, ctx.base_dir);
  inputToAbsoluteFilter(theme, ctx.theme_dir);
  inputToAbsoluteFilter(override, ctx.base_dir);

  const _default = {
    output: {
      format: 'esm'
    },
    onwarn(warning) {
      ctx.log.warning(warning);
    }
  };

  return Object.assign(_default, site, theme, override);
};

/**
 * @param {string} path
 * @param {Hexo} ctx
 */
const getRollupConfig = (path, ctx) => {
  const config = getMergeRollupConfigs(ctx);

  if (!isEntry(path, config.input)) {
    return null;
  }

  config.input = path;

  return {
    input: objectWithoutKeys(config, ['output']),
    output: config.output
  };
};

module.exports = getRollupConfig;

'use strict';
const { rollup } = require('rollup');
const getRollupConfig = require('./getRollupConfig');

/** @typedef {NodeJS.EventEmitter} Hexo */

/** @type {rollup.ModuleJSON[]} */
let rollupCache = [];

/**
 * @param {{ input: rollup.RollupFileOptions; output: rollup.OutputOptions; }} config
 * @return { Promise<string> }
 */
const rollupRenderAsync = async config => {
  config.input.cache = rollupCache;

  const bundle = await rollup(config.input);

  rollupCache = bundle.cache;

  const { code } = await bundle.generate(config.output);
  return code;
};

/**
 * @param {object} _data
 * @param {string?} _data.path
 * @param {string?} _data.text
 * @returns {Promise<string>}
 */
function renderer({path, text}) {
  const config = getRollupConfig(path, this);

  if (config == null) {
    return text;
  }

  return rollupRenderAsync(config).catch(err => {
    this.log.error(err);
    throw err;
  });
}

module.exports = renderer;

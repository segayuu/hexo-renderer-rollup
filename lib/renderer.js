'use strict';
const { rollup } = require('rollup');
const HexoRollupConfigs = require('./HexoRollupConfigs');
const objectWithoutKeys = require('./utils/objectWithoutKeys');

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
  const rollupConfigs = new HexoRollupConfigs(this);
  const config = rollupConfigs.merged();

  if (config.experimentalCodeSplitting) {
    throw new Error('hexo-renderer-rollup not Support "experimentalCodeSplitting".');
  }

  if (!config.input.includes(path)) {
    return text;
  }

  config.input = path;

  const input = objectWithoutKeys(config, ['output']);
  const { output } = config;

  return rollupRenderAsync({ input, output }).catch(err => {
    this.log.error(err);
    throw err;
  });
}

module.exports = renderer;

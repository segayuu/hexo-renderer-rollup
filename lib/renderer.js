'use strict';
const { rollup } = require('rollup');
const getRollupConfig = require('./getRollupConfig');

/** @typedef {NodeJS.EventEmitter} Hexo */

/**
 * @param {{ input: RollupFileOptions; output: object; }} config
 * @return { Promise<string> }
 */
const rollupRenderAsync = async config => {
  const bundle = await rollup(config.input);
  const { code } = await bundle.generate(config.output);
  return code;
};

/**
 * @param {Hexo} hexo
 * @returns {Promise<string>}
 */
function renderer({path, text}) {
  const config = getRollupConfig(path, this);

  if (config == null) {
    return text;
  }

  return rollupRenderAsync(config, this).catch(err => {
    this.log.error(err);
    throw err;
  });
}

module.exports = renderer;

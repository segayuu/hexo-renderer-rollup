'use strict';

const rollupPluginFromName = require('./rollupPluginFromName');
const objectWithoutKeys = require('./objectWithoutKeys');

/**
 * @param {string|{name:string}} config
 */
const createRollupPlugin = config => {
  if (typeof config === 'string') {
    return rollupPluginFromName(config, {});
  }
  if (typeof config === 'object' && 'name' in config) {
    return rollupPluginFromName(config.name, objectWithoutKeys(config, 'name'));
  }
  throw new TypeError('config most object!');
};

module.exports = createRollupPlugin;

'use strict';

const rollupPluginFromName = require('./rollupPluginFromName');
const objectWithoutKeys = require('./objectWithoutKeys');

/**
 * @param {string|{name:string}} config
 */
const createRollupPlugin = config => {
  if (typeof config === 'string') {
    return rollupPluginFromName(config)({});
  }
  if (typeof config === 'object' && 'name' in config) {
    const plugin = rollupPluginFromName(config.name);
    const options = objectWithoutKeys(config, ['name']);
    return plugin(options);
  }
  throw new TypeError('config most object!');
};

module.exports = createRollupPlugin;

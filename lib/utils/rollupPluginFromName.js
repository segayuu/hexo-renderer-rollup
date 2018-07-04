'use strict';

/**
 * @param {string} name
 * @param {*} options
 */
const rollupPluginFromName = (name, options = {}) => {
  if (typeof name !== 'string') {
    throw new TypeError('name most string');
  }
  const pluginPrefix = 'rollup-plugin-';

  if (!name.startsWith(pluginPrefix)) {
    name = pluginPrefix + name;
  }

  const plugin = require(name);
  return plugin(options);
};

module.exports = rollupPluginFromName;

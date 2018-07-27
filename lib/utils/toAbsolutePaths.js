'use strict';
const { join, isAbsolute } = require('path');
const objectMap = require('./objectMap');

/**
 * @param {string|Iterable<string>|ArrayLike<string>|Object.<string, string>} targets
 * @param {string} base
 * @return {string|string[]}
 */
const toAbsolutePath = (targets, base) => {
  if (targets == null) {
    return [];
  }
  if (typeof targets === 'string') {
    if (isAbsolute(targets)) {
      return targets;
    }
    return join(base, targets);
  }

  // Convert config of the entry from object.
  return objectMap(targets, x => { return isAbsolute(x) ? x : join(base, x); });
};

module.exports = toAbsolutePath;

'use strict';

/**
 * @param {object} obj
 * @param {string[]} keys
 */
const objectWithoutKeys = (obj, keys) => {
  if (!Array.isArray(keys)) {
    throw new TypeError('keys most string[].');
  }
  return Object.keys(obj).reduce((newObject, key) => {
    if (!keys.includes(key)) newObject[key] = obj[key];
    return newObject;
  }, {});
};

module.exports = objectWithoutKeys;

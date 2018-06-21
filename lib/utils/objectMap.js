'use strict';

/**
 * @template T
 * @template R
 * @template U
 * @param {Iterable<T>|ArrayLike<T>|Object.<string, T>} obj
 * @param {(this: U, value: T) => R} callback
 * @param {U} thisArg
 * @return {R[]}
 */
const objectMap = (obj, callback, thisArg = undefined) => {
  if (obj == null) {
    throw new TypeError();
  }

  if (Array.isArray(obj)) {
    return obj.map(callback, thisArg);
  }

  const type = typeof obj;

  if (type !== 'object' && type !== 'string') {
    throw new TypeError();
  }

  // maybe iterable(or string)
  if (typeof obj[Symbol.iterator] === 'function') {
    return Array.from(obj, callback, thisArg);
  }

  // maybe ArrayLike
  if (typeof obj.length === 'number') {
    return Array.from(obj, callback, thisArg);
  }

  return Object.values(obj).map(callback, thisArg);
};

module.exports = objectMap;

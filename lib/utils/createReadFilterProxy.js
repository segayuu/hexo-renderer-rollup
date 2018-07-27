'use strict';

const createReadFilterProxy = (target, filters = {}) => {
  if (target == null || typeof target !== 'object') {
    throw new TypeError();
  }

  let filterKeys = Object.keys(filters).filter(key => typeof filters[key] === 'function');

  if (!filterKeys) {
    return target;
  }

  const filtersMap = filterKeys.reduce((result, key) => {
    result[key] = filters[key];
    return result;
  }, Object.create(null));

  filters = null;
  filterKeys = null;

  return new Proxy(target, {
    get(target, property, receiver) {
      const original = Reflect.get(target, property, receiver);
      return property in filtersMap ? filtersMap[property](original, target) : original;
    }
  });
};

module.exports = createReadFilterProxy;

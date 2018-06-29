'use strict';

const toAbsolutePath = require('./utils/toAbsolutePaths');
const { getRawConfigs } = require('./utils/getHexoConfigs');
const { join } = require('path');

/** @typedef {NodeJS.EventEmitter} Hexo */

/**
 * @param {string} target
 * @param {string|string[]} entrys
 */
const isEntry = (target, entrys) => {
  if (entrys == null || entrys.length < 1) {
    return false;
  }
  if (typeof entrys === 'string') {
    return entrys === target;
  }
  return entrys.includes(target);
};

/**
 * @param {object} obj
 * @param {string[]} keys
 */
function objectWithoutKeys(obj, keys) {
  return Object.keys(obj).reduce((newObject, key) => {
    if (!keys.includes(key)) newObject[key] = obj[key];
    return newObject;
  }, {});
}

const rollupPluginFromName = (name, ctx, isTheme) => {
  const pluginPrefix = 'rollup-plugin-';

  if (!name.startsWith(pluginPrefix)) {
    name = pluginPrefix + name;
  }

  const resolvePaths = require.resolve.paths(name);

  if (isTheme) {
    const themePath = join(ctx.theme_dir + 'node_modules');
    resolvePaths.unshift(themePath);
  }

  const path = require.resolve(name, { paths: resolvePaths });
  const plugin = require(path);
  return plugin();
};

const toAbsoluteProxy = (config, baseDir) => {
  if (config == null) {
    return config;
  }
  return new Proxy(config, {
    get(target, property, receiver) {
      const original = Reflect.get(target, property, receiver);
      if (property === 'input' && 'input' in target) {
        const input = original;
        return toAbsolutePath(input, baseDir);
      }
      return original;
    }
  });
};

const createPluginProxy = (config, ctx, isTheme) => {
  if (config == null) {
    return config;
  }
  return new Proxy(config, {
    get(target, property, receiver) {
      const original = Reflect.get(target, property, receiver);
      if (property === 'plugins' && 'plugins' in target) {
        const plugins = original;

        if (Array.isArray(plugins)) {
          return plugins.map(plugin => rollupPluginFromName(plugin, ctx, isTheme));
        } else if (typeof plugins === 'string') {
          return rollupPluginFromName(plugins, ctx, isTheme);
        }
      }
      return original;
    }
  });
};

const getMergeRollupConfigs = ctx => {
  let { site, theme, override } = getRawConfigs('rollup', ctx);

  site = toAbsoluteProxy(site, ctx.base_dir);
  theme = toAbsoluteProxy(theme, ctx.theme_dir);
  override = toAbsoluteProxy(override, ctx.base_dir);

  site = createPluginProxy(site, ctx, false);
  theme = createPluginProxy(theme, ctx, true);
  override = createPluginProxy(override, ctx, true);

  const _default = {
    output: {
      format: 'esm'
    },
    onwarn(warning) {
      ctx.log.warning(warning);
    }
  };

  return Object.assign(_default, site, theme, override);
};

/**
 * @param {string} path
 * @param {Hexo} ctx
 */
const getRollupConfig = (path, ctx) => {
  const config = getMergeRollupConfigs(ctx);

  if (!isEntry(path, config.input)) {
    return null;
  }

  config.input = path;

  return {
    input: objectWithoutKeys(config, ['output']),
    output: config.output
  };
};

module.exports = getRollupConfig;

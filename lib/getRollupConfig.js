'use strict';

const toAbsolutePath = require('./utils/toAbsolutePaths');
const objectWithoutKeys = require('./utils/objectWithoutKeys');
const createRollupPlugin = require('./utils/createRollupPlugin');
const {
  getRawSiteConfig,
  getRawThemeConfig,
  getRawOverrideThemeConfig
} = require('./utils/getHexoConfigs');

/** @typedef {NodeJS.EventEmitter} Hexo */

const configFilterProxy = (config, baseDir) => {
  if (config == null) {
    return config;
  }
  return new Proxy(config, {
    get(target, property, receiver) {
      const original = Reflect.get(target, property, receiver);
      if (property === 'input' && 'input' in target) {
        return toAbsolutePath(original, baseDir);
      }
      if (property === 'plugins' && 'plugins' in target) {
        const plugins = original;

        if (Array.isArray(plugins)) {
          return plugins.map(plugin => createRollupPlugin(plugin));
        }

        return createRollupPlugin(plugins);
      }
      return original;
    }
  });
};

const getSiteRollupConfig = ctx => {
  const raw = getRawSiteConfig('rollup', ctx);
  return configFilterProxy(raw, ctx.base_dir);
};

const getThemeRollupConfig = ctx => {
  const raw = getRawThemeConfig('rollup', ctx);
  return configFilterProxy(raw, ctx.theme_dir);
};

const getRollupOverrideThemeConfig = ctx => {
  const raw = getRawOverrideThemeConfig('rollup', ctx);
  return configFilterProxy(raw, ctx.base_dir);
};

const getMergeRollupConfigs = ctx => {
  const site = getSiteRollupConfig(ctx);
  const theme = getThemeRollupConfig(ctx);
  const override = getRollupOverrideThemeConfig(ctx);

  const _default = {
    output: {
      format: 'esm'
    },
    onwarn(warning) {
      ctx.log.warning(warning);
    }
  };

  const input = [site, theme, override]
    .filter(config => config != null && 'input' in config)
    .map(config => config.input)
    .reduce((array, input) => {
      if (typeof input === 'string') {
        array.push(input);
      } else if (Array.isArray(input)) {
        array = array.concat(input);
      } else if (typeof input === 'object') {
        array = array.concat(Array.from(Object.values(input)));
      }
      return array;
    }, []);

  return Object.assign(_default, site, theme, override, { input });
};

/**
 * @param {string} path
 * @param {Hexo} ctx
 */
const getRollupConfig = (path, ctx) => {
  const config = getMergeRollupConfigs(ctx);

  if (config.experimentalCodeSplitting) {
    throw new Error('hexo-renderer-rollup not Support "experimentalCodeSplitting".');
  }

  if (!config.input.includes(path)) {
    return null;
  }

  config.input = path;

  return {
    input: objectWithoutKeys(config, ['output']),
    output: config.output
  };
};

module.exports = getRollupConfig;

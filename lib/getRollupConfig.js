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

/**
 * @param {Array<string|string[]|Object<string, string>} array
 */
const reduceStrings = (array) => {
  const initial = [];

  return array.reduce((array, item) => {
    if (typeof item === 'string') {
      array.push(item);
    } else if (Array.isArray(item)) {
      array = array.concat(item);
    } else if (typeof item === 'object') {
      array = array.concat(Array.from(Object.values(item)));
    }
    return array;
  }, initial);
};

class HexoRollupConfigs {
  constructor(ctx) {
    this.ctx = ctx;
  }
  site() {
    const raw = getRawSiteConfig('rollup', this.ctx);
    return configFilterProxy(raw, this.ctx.base_dir);
  }
  theme() {
    const raw = getRawThemeConfig('rollup', this.ctx);
    return configFilterProxy(raw, this.ctx.theme_dir);
  }
  overrideTheme() {
    const raw = getRawOverrideThemeConfig('rollup', this.ctx);
    return configFilterProxy(raw, this.ctx.base_dir);
  }
  merged() {
    const site = this.site();
    const theme = this.theme();
    const override = this.overrideTheme();

    const _default = {
      output: {
        format: 'esm'
      },
      onwarn(warning) {
        this.ctx.log.warning(warning);
      }
    };

    const input = reduceStrings(
      [site, theme, override]
        .filter(config => config != null && 'input' in config)
        .map(config => config.input)
    );

    return Object.assign(_default, site, theme, override, { input });
  }
}

/**
 * @param {string} path
 * @param {Hexo} ctx
 */
const getRollupConfig = (path, ctx) => {
  const rollupConfigs = new HexoRollupConfigs(ctx);
  const config = rollupConfigs.merged();

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

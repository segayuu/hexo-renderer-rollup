'use strict';
const objectMap = require('../lib/utils/objectMap');
const toAbsolutePaths = require('../lib/utils/toAbsolutePaths');
const {
  getRawSiteConfig,
  getRawThemeConfig,
  getRawOverrideThemeConfig,
  getRawConfigs,
  getRawAllConfigs
} = require('../lib/utils/getHexoConfigs');
const rollupPluginFromName = require('../lib/utils/rollupPluginFromName');
const objectWithoutKeys = require('../lib/utils/objectWithoutKeys');
const createRollupPlugin = require('../lib/utils/createRollupPlugin');

const rollupPluginJson = require('rollup-plugin-json');

const { join } = require('path');

const { createSandbox, process } = require('hexo-test-utils/core');
const Hexo = require('hexo');

/** @type {(fixture?: string) => Promise<Hexo>} */
const sandbox = createSandbox(Hexo, {
  fixture_folder: `${__dirname}/fixtures`
});

describe('objectMap', () => {
  test('Array', () => {
    const src = [1, 2, 3];
    const result = objectMap(src, i => i + 3);
    expect(result).toEqual([4, 5, 6]);
  });

  test('Iterable', () => {
    const src = function* () {
      yield 1;
      yield 2;
      yield 3;
    };
    const result = objectMap(src(), i => i + 3);
    expect(result).toEqual([4, 5, 6]);
  });

  test('ArrayLike', () => {
    const src = {
      length: 3,
      0: 1,
      1: 2,
      2: 3
    };
    const result = objectMap(src, i => i + 3);
    expect(result).toEqual([4, 5, 6]);
  });

  test('plain Object', () => {
    const src = {
      a: 1,
      b: 2,
      c: 3
    };
    const result = objectMap(src, i => i + 3);
    expect(result).toEqual([4, 5, 6]);
  });
});

describe('toAbsolutePaths', () => {
  test('string', () => {
    const src = 'test.js';
    const result = toAbsolutePaths(src, __dirname);

    expect(result).toBe(join(__dirname, src));
  });

  test('string[]', () => {
    const src = ['test1.js', 'test2.js'];
    const result = toAbsolutePaths(src, __dirname);

    expect(result).toEqual([
      join(__dirname, 'test1.js'),
      join(__dirname, 'test2.js')
    ]);
  });

  test('object.<any, string>', () => {
    const src = {
      entry1: 'test1.js',
      entry2: 'test2.js'
    };
    const result = toAbsolutePaths(src, __dirname);

    expect(result).toEqual([
      join(__dirname, 'test1.js'),
      join(__dirname, 'test2.js')
    ]);
  });
});

describe('getHexoConfigs', () => {
  test('getRawSiteConfig', async () => {
    const hexo = await sandbox();
    const result = getRawSiteConfig('title', hexo);
    expect(result).toBe('Hexo');
  });

  test('getRawThemeConfig', async () => {
    const hexo = await sandbox('mock_theme_config');
    await process(hexo);

    const result = getRawThemeConfig('default_layout', hexo);

    expect(result).toBe('post');
  });

  test('getRawOverrideThemeConfig', async () => {
    const hexo = await sandbox('mock_theme_config');
    await process(hexo);

    const result = getRawOverrideThemeConfig('baseColor', hexo);

    expect(result).toBe('blue');
  });

  test('getRawConfigs', async () => {
    const hexo = await sandbox('mock_theme_config');
    await process(hexo);

    const result = getRawConfigs('title', hexo);

    expect(result).toHaveProperty('site', 'Hexo');
    expect(result).toHaveProperty('theme', undefined);
    expect(result).toHaveProperty('override', undefined);
  });

  test('getRawAllConfigs', async () => {
    const hexo = await sandbox('mock_theme_config');
    await process(hexo);

    const result = getRawAllConfigs(hexo);

    expect(result).toHaveProperty(['site', 'title']);
    expect(result).toHaveProperty(['theme', 'default_layout']);
    expect(result).toHaveProperty(['override', 'baseColor']);
  });
});

describe('rollupPluginName', () => {
  test('no prefix', () => {
    const result = rollupPluginFromName('json');
    const plugin = rollupPluginJson();
    expect(result).toHaveProperty('name', plugin.name);
    expect(result).toHaveProperty(['transform', 'name'], plugin.transform.name);
  });

  test('has prefix', () => {
    const result = rollupPluginFromName('rollup-plugin-json');
    const plugin = rollupPluginJson();
    expect(result).toHaveProperty('name', plugin.name);
    expect(result).toHaveProperty(['transform', 'name'], plugin.transform.name);
  });
});

describe('createRollupPlugin', () => {
  test('no prefix', () => {
    const result = createRollupPlugin('json', {});
    const plugin = rollupPluginJson();
    expect(result).toHaveProperty('name', plugin.name);
    expect(result).toHaveProperty(['transform', 'name'], plugin.transform.name);
  });

  test('has prefix', () => {
    const result = createRollupPlugin('rollup-plugin-json', {});
    const plugin = rollupPluginJson();
    expect(result).toHaveProperty('name', plugin.name);
    expect(result).toHaveProperty(['transform', 'name'], plugin.transform.name);
  });
});

test('objectWithoutKeys', () => {
  const input = {
    key1: true,
    key2: false
  };

  const result = objectWithoutKeys(input, ['key1']);
  expect(input).toHaveProperty('key1', true);
  expect(result).toHaveProperty('key2');
  expect(result).not.toHaveProperty('key1');
});

test('objectWithoutKeys - most string[]', () => {
  expect(() => {
    objectWithoutKeys({}, 'key1');
  }).toThrow();
});

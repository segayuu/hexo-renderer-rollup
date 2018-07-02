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

    expect(result).toHaveProperty('site');
    expect(result).toHaveProperty('theme');
    expect(result).toHaveProperty('override');

    expect(result.site).toBe('Hexo');
    expect(result.theme).toBeUndefined();
    expect(result.override).toBeUndefined();
  });

  test('getRawAllConfigs', async () => {
    const hexo = await sandbox('mock_theme_config');
    await process(hexo);

    const result = getRawAllConfigs(hexo);

    expect(result).toHaveProperty('site');
    expect(result).toHaveProperty('theme');
    expect(result).toHaveProperty('override');

    expect(result.site).toHaveProperty('title');
    expect(result.theme).toHaveProperty('default_layout');
    expect(result.override).toHaveProperty('baseColor');
  });
});

'use strict';
const {
  getRawSiteConfig,
  getRawThemeConfig,
  getRawOverrideThemeConfig,
  getRawConfigs,
  getRawAllConfigs
} = require('../../lib/utils/getHexoConfigs');

const { createSandbox, process } = require('hexo-test-utils/core');
const Hexo = require('hexo');

/** @type {(fixture?: string) => Promise<Hexo>} */
const sandbox = createSandbox(Hexo, {
  fixture_folder: `${__dirname}/../fixtures`
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

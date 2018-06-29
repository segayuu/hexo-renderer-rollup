'use strict';
const Hexo = require('hexo');
const { createSandbox, process } = require('hexo-test-utils/core');

const { join } = require('path');
const fixture_folder = join(__dirname, 'fixtures');

/**
 * @param {string} path
 * @param {Hexo} ctx
 */
const jsRender = (path, ctx) => ctx.render.render({ path });

/** @type {(fixture?: string) => Promise<Hexo>} */
const sandbox = createSandbox(Hexo, { fixture_folder, plugins: [require.resolve('../lib')] });

test('site plugins', async () => {
  const fixtureName = 'site_plugin';
  const fixturePath = join(fixture_folder, fixtureName);
  const hexo = await sandbox(fixtureName);
  await process(hexo);

  const result = await jsRender(join(fixturePath, 'app.mjs'), hexo);
  expect(result).toEqual([
    'var hexoRollup = (function () {',
    '    \'use strict\';',
    '',
    '    var result = true;',
    '',
    '    return result;',
    '',
    '}());',
    ''
  ].join('\n'));
});

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

test('through', async () => {
  const fixtureName = 'simple';
  const fixturePath = join(fixture_folder, fixtureName);
  const hexo = await sandbox(fixtureName);
  await process(hexo);

  const result = await jsRender(join(fixturePath, 'app.js'), hexo);
  expect(result).toBe([
    'function add(a, b) {',
    '    return a + b;',
    '}',
    '',
    'export { add };',
    ''
  ].join('\n'));
});

test('iife', async () => {
  const fixtureName = 'simple';
  const fixturePath = join(fixture_folder, fixtureName);
  const hexo = await sandbox(fixtureName);

  hexo.config.rollup.output = {
    file: 'bundle.js',
    format: 'iife',
    name: 'hexoRollup'
  };

  await process(hexo);

  const result = await jsRender(join(fixturePath, 'app.js'), hexo);
  expect(result).toBe([
    'var hexoRollup = (function (exports) {',
    '    \'use strict\';',
    '',
    '    function add(a, b) {',
    '        return a + b;',
    '    }',
    '',
    '    exports.add = add;',
    '',
    '    return exports;',
    '',
    '}({}));',
    ''
  ].join('\n'));
});

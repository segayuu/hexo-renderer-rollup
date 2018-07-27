'use strict';

const createRollupPlugin = require('../../lib/utils/createRollupPlugin');

const rollupPluginJson = require('rollup-plugin-json');
const { readFile } = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(readFile);

describe('createRollupPlugin', () => {
  test('no prefix', () => {
    const result = createRollupPlugin('json');
    const plugin = rollupPluginJson();
    expect(result).toHaveProperty('name', plugin.name);
    expect(result).toHaveProperty(['transform', 'name'], plugin.transform.name);
  });

  test('has prefix', () => {
    const result = createRollupPlugin('rollup-plugin-json');
    const plugin = rollupPluginJson();
    expect(result).toHaveProperty('name', plugin.name);
    expect(result).toHaveProperty(['transform', 'name'], plugin.transform.name);
  });

  test('object', () => {
    const result = createRollupPlugin({ name: 'json' });
    const plugin = rollupPluginJson();
    expect(result).toHaveProperty('name', plugin.name);
    expect(result).toHaveProperty(['transform', 'name'], plugin.transform.name);
  });

  test('options', async () => {
    const options = { indent: '  ' };
    const filename = 'input.json';

    const plugin = createRollupPlugin(Object.assign({ name: 'json' }, options));
    const direct = rollupPluginJson(options);

    const input = await readFileAsync(`${__dirname}/../sample/form/${filename}`);

    expect(plugin.transform(input, filename)).toEqual(direct.transform(input, filename));
  });

  test('most name a string', () => {
    expect(createRollupPlugin).toThrow(TypeError);
  });

  test('invalid name', () => {
    expect(() => { createRollupPlugin('invalid'); }).toThrow();
  });
});

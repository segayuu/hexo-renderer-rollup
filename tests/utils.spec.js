'use strict';
const toAbsolutePaths = require('../lib/utils/toAbsolutePaths');
const rollupPluginFromName = require('../lib/utils/rollupPluginFromName');
const objectWithoutKeys = require('../lib/utils/objectWithoutKeys');

const rollupPluginJson = require('rollup-plugin-json');

const { join } = require('path');

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

describe('rollupPluginFromName', () => {
  test('no prefix', () => {
    const result = rollupPluginFromName('json');
    expect(result).toBe(rollupPluginJson);
  });

  test('has prefix', () => {
    const result = rollupPluginFromName('rollup-plugin-json');
    expect(result).toBe(rollupPluginJson);
  });

  test('most name a string', () => {
    expect(rollupPluginFromName).toThrow(TypeError);
  });

  test('invalid name', () => {
    expect(() => { rollupPluginFromName('invalid'); }).toThrow();
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

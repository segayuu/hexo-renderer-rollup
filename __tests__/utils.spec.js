'use strict';
const objectMap = require('../lib/utils/objectMap');
const toAbsolutePaths = require('../lib/utils/toAbsolutePaths');

const { join } = require('path');

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

'use strict';
const objectMap = require('../../lib/utils/objectMap');

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

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { convert } = require('./tempconv');

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} !== ${expected}`);

test('converte nos 6 sentidos', () => {
  [
    [100, 'C', 'F', 212],
    [0, 'C', 'K', 273.15],
    [212, 'F', 'C', 100],
    [32, 'F', 'K', 273.15],
    [273.15, 'K', 'C', 0],
    [373.15, 'K', 'F', 212],
  ].forEach(([val, from, to, expected]) => near(convert(val, from, to), expected));
});

test('mesma unidade devolve o valor', () => {
  assert.equal(convert(42, 'C', 'C'), 42);
});

test('zero absoluto: limite exato é aceito', () => {
  [[-273.15, 'C', 'K', 0], [-459.67, 'F', 'K', 0], [0, 'K', 'C', -273.15]]
    .forEach(([val, from, to, expected]) => near(convert(val, from, to), expected));
});

test('zero absoluto: abaixo do limite é rejeitado', () => {
  [[-273.16, 'C'], [-459.68, 'F'], [-0.01, 'K']]
    .forEach(([val, from]) => assert.throws(() => convert(val, from, 'K'), RangeError));
});

test('unidades inválidas', () => {
  assert.throws(() => convert(1, 'X', 'C'), RangeError);
  assert.throws(() => convert(1, 'C', 'X'), RangeError);
  assert.throws(() => convert(1, 'c', 'f'), RangeError);
});

test('valor não finito é rejeitado', () => {
  assert.throws(() => convert(NaN, 'C', 'F'), TypeError);
});

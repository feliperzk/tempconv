'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { convert } = require('./tempconv');

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} !== ${expected}`);
const cli = (...args) => spawnSync(process.execPath, [require.resolve('./tempconv'), ...args], { encoding: 'utf8' });

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

test('unidades inválidas, inclusive não-strings (sem coerção)', () => {
  ['X', 'c', ['C'], null, undefined, 1].forEach((unit) => {
    assert.throws(() => convert(1, unit, 'C'), RangeError);
    assert.throws(() => convert(1, 'C', unit), RangeError);
  });
});

test('valor não finito é rejeitado', () => {
  assert.throws(() => convert(NaN, 'C', 'F'), TypeError);
});

test('overflow do resultado é rejeitado', () => {
  assert.throws(() => convert(1e308, 'C', 'F'), RangeError);
});

test('CLI: sucesso imprime resultado e sai com 0', () => {
  const { status, stdout } = cli('100', 'C', 'F');
  assert.equal(status, 0);
  assert.equal(stdout, '212.00 F\n');
});

test('CLI: entrada inválida sai com 1 e escreve em stderr', () => {
  [['-300', 'C', 'F'], ['10', 'C', 'X'], ['abc', 'C', 'F'], ['10', 'C'], []].forEach((args) => {
    const { status, stdout, stderr } = cli(...args);
    assert.equal(status, 1, `args: ${args}`);
    assert.equal(stdout, '');
    assert.match(stderr, /^Erro: /);
  });
});

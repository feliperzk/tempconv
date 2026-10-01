'use strict';

/** Zero absoluto por unidade; entradas estritamente menores são rejeitadas, o limite exato é aceito. */
const ABSOLUTE_ZERO = Object.freeze({ C: -273.15, F: -459.67, K: 0 });

/** Conversão de cada unidade para Celsius (unidade pivô). */
const TO_CELSIUS = Object.freeze({
  C: (val) => val,
  F: (val) => (val - 32) * 5 / 9,
  K: (val) => val - 273.15,
});

/** Conversão de Celsius para cada unidade. */
const FROM_CELSIUS = Object.freeze({
  C: (c) => c,
  F: (c) => c * 9 / 5 + 32,
  K: (c) => c + 273.15,
});

const USAGE = 'Uso: node tempconv.js <valor> <origem> <destino> (unidades: C, F, K)';

/** Lança se `unit` não for exatamente a string `C`, `F` ou `K` (sem coerção: `['C']` é inválido). */
const assertUnit = (unit, label) => {
  if (typeof unit !== 'string' || !Object.hasOwn(ABSOLUTE_ZERO, unit)) {
    throw new RangeError(`Unidade de ${label} inválida: "${String(unit)}" (use a string C, F ou K)`);
  }
};

/**
 * Converte uma temperatura entre Celsius, Fahrenheit e Kelvin, sem arredondar.
 * @param {number} val Valor finito, maior ou igual ao zero absoluto em `fromUnit`.
 * @param {'C'|'F'|'K'} fromUnit Unidade de origem.
 * @param {'C'|'F'|'K'} toUnit Unidade de destino.
 * @returns {number} Valor convertido.
 * @throws {TypeError} Se `val` não for um número finito.
 * @throws {RangeError} Se alguma unidade for inválida, `val` estiver abaixo do zero absoluto ou o resultado não for finito.
 */
const convert = (val, fromUnit, toUnit) => {
  if (!Number.isFinite(val)) throw new TypeError('Valor inválido: informe um número finito');
  assertUnit(fromUnit, 'origem');
  assertUnit(toUnit, 'destino');
  if (val < ABSOLUTE_ZERO[fromUnit]) {
    throw new RangeError(`Valor ${val} ${fromUnit} está abaixo do zero absoluto (${ABSOLUTE_ZERO[fromUnit]} ${fromUnit})`);
  }
  const result = fromUnit === toUnit ? val : FROM_CELSIUS[toUnit](TO_CELSIUS[fromUnit](val));
  if (!Number.isFinite(result)) throw new RangeError(`Resultado de ${val} ${fromUnit} em ${toUnit} excede o limite numérico`);
  return result;
};

/** Interpreta o texto inteiro como número; vazio vira NaN (`Number('')` seria 0). */
const parseValue = (text) => (text.trim() === '' ? NaN : Number(text));

/** Traduz os argumentos da CLI na linha de saída `%.2f UNIDADE`; lança em qualquer entrada inválida. */
const run = (args) => {
  if (args.length !== 3) throw new Error(USAGE);
  const [rawValue, fromUnit, toUnit] = args;
  return `${convert(parseValue(rawValue), fromUnit, toUnit).toFixed(2)} ${toUnit}`;
};

if (require.main === module) {
  try {
    console.log(run(process.argv.slice(2)));
  } catch (error) {
    console.error(`Erro: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { convert };

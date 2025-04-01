export function roundWithPrecision(value, { precision } = { precision: 2 }) {
  const exponent = 10 ** precision;

  return Math.round(value * exponent) / exponent;
}
import { log } from '@kot-shrodingera-team/germes-utils';

const defaultCoefficientRegex = /(\d+(?:\.\d+)?)/;

const getCoefficientGenerator = (options: {
  coefficientSelector: string;
  getCoefficientText?: () => string;
  coefficientRegex?: RegExp;
  context?: Document | Element;
}) => (): number => {
  if (options.getCoefficientText) {
    const coefficientText = options.getCoefficientText();
    const coefficient = Number(coefficientText);
    if (Number.isNaN(coefficient)) {
      log(`Непонятный формат коэффициента: "${coefficientText}"`, 'crimson');
      return 0;
    }
    return coefficient;
  }
  const context = options.context ? options.context : document;
  const coefficientElement = context.querySelector(options.coefficientSelector);
  if (!coefficientElement) {
    log('Коэффициент не найден', 'crimson');
    return 0;
  }
  const coefficientText = coefficientElement.textContent.trim();
  const coefficientRegex = options.coefficientRegex
    ? options.coefficientRegex
    : defaultCoefficientRegex;
  const coefficientMatch = coefficientText.match(coefficientRegex);
  if (!coefficientMatch) {
    log(`Непонятный формат коэффициента: "${coefficientText}"`, 'crimson');
    return 0;
  }
  const coefficient = Number(coefficientMatch[1]);
  return coefficient;
};

export default getCoefficientGenerator;

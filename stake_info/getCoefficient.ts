import { log } from '@kot-shrodingera-team/germes-utils';

const getCoefficientGenerator = (options: {
  coefficientSelector: string;
  context?: Document | Element;
}) => (): number => {
  const context = options.context ? options.context : document;
  const coefficientElement = context.querySelector(options.coefficientSelector);
  if (!coefficientElement) {
    log('Коэффициент не найден', 'crimson');
    return 0;
  }
  const coefficientText = coefficientElement.textContent.trim();
  const coefficient = Number(coefficientText);
  if (Number.isNaN(coefficient)) {
    log(`Непонятный формат коэффициента: "${coefficientText}"`, 'crimson');
    return 0;
  }
  return coefficient;
};

export default getCoefficientGenerator;

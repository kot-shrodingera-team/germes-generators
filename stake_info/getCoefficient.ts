import { log } from '@kot-shrodingera-team/germes-utils';

const getCoefficientGenerator = (options: {
  coefficientSelector: string;
}) => (): number => {
  const coefficientElement = document.querySelector(
    options.coefficientSelector
  );
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

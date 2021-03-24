import { log } from '@kot-shrodingera-team/germes-utils';
import { defaultRemoveRegex, defaultNumberRegex } from './defaultRegexes';

/**
 * Генератор функции получения коэффициента
 * @param options Опции:
 * - coefficientSelector - Селектор элемента коэффициента
 * - getCoefficientText - Функция получения текста коэффициента, если указана, то используется она, а не поиск элемента по селектору
 * - replaceDataArray - Массив заменяемых значений в тексте элемента коэффициента
 * -- searchValue - Искомое значение
 * -- replaceValue - Значение, на которое заменяется
 * - removeRegex - Регулярное выражение для удаления символов из текста элемента коэффициента, по умолчанию /[\s,']/g;
 * - coefficientRegex - Регулярное выражение для получения значения коэффициента из полученного текста, по умолчанию /(\d+(?:\.\d+)?)/
 * - context - Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
 * @returns Функция, которая возвращает коэффициент
 */
const getCoefficientGenerator = (options: {
  coefficientSelector: string;
  getCoefficientText?: () => string;
  replaceDataArray?: {
    searchValue: string | RegExp;
    replaceValue: string;
  }[];
  removeRegex?: RegExp;
  coefficientRegex?: RegExp;
  context?: () => Document | Element;
}) => (): number => {
  const context = options.context ? options.context() : document;
  if (options.getCoefficientText) {
    const coefficientText = options.getCoefficientText();
    const coefficient = Number(coefficientText);
    if (Number.isNaN(coefficient)) {
      log(`Непонятный формат коэффициента: "${coefficientText}"`, 'crimson');
      return 0;
    }
    return coefficient;
  }
  const coefficientElement = context.querySelector(options.coefficientSelector);
  if (!coefficientElement) {
    log('Коэффициент не найден', 'crimson');
    return 0;
  }
  let coefficientText = coefficientElement.textContent.trim();
  if (options.replaceDataArray) {
    options.replaceDataArray.forEach((replaceData) => {
      coefficientText = coefficientText.replace(
        replaceData.searchValue,
        replaceData.replaceValue
      );
    });
  }
  const removeRegex = options.removeRegex
    ? options.removeRegex
    : defaultRemoveRegex;
  coefficientText = coefficientText.replace(removeRegex, '');
  const coefficientRegex = options.coefficientRegex
    ? options.coefficientRegex
    : defaultNumberRegex;
  const coefficientMatch = coefficientText.match(coefficientRegex);
  if (!coefficientMatch) {
    log(`Непонятный формат коэффициента: "${coefficientText}"`, 'crimson');
    return 0;
  }
  const coefficient = Number(coefficientMatch[1]);
  return coefficient;
};

export default getCoefficientGenerator;

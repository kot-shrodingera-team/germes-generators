import { getWorkerParameter, log } from '@kot-shrodingera-team/germes-utils';
import { defaultRemoveRegex, defaultNumberRegex } from './defaultRegexes';

/**
 * Опции генератора функции получения коэффициента
 */
interface GetCoefficientGeneratorOptions {
  /**
   * Селектор элемента коэффициента
   */
  coefficientSelector: string;
  /**
   * Функция получения текста коэффициента
   * Если указана, то используется она, а не поиск элемента по селектору
   */
  getCoefficientText?: () => string;
  /**
   * Заменяемые подстроки в тексте элемента коэффициента
   *
   * Используется, например, если нужно заменить запятые на точки
   */
  replaceDataArray?: {
    /**
     * Искомый текст/регулярное выражение
     */
    searchValue: string | RegExp;
    /**
     * Текст, на который производится замена
     */
    replaceValue: string;
  }[];
  /**
   * Регулярное выражение для удаления символов из текста элемента коэффициента, по умолчанию /[\s,']/g;
   */
  removeRegex?: RegExp;
  /**
   * Регулярное выражение для получения значения коэффициента из полученного текста, по умолчанию /(\d+(?:\.\d+)?)/
   */
  coefficientRegex?: RegExp;
  /**
   * Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
   */
  context?: () => Document | Element;
}

/**
 * Генератор функции получения коэффициента
 * @returns Функция, которая возвращает коэффициент
 */
const getCoefficientGenerator = (
  options: GetCoefficientGeneratorOptions
) => (): number => {
  if (
    getWorkerParameter('fakeCoefficient') ||
    getWorkerParameter('fakeOpenStake')
  ) {
    const coefficient = Number(JSON.parse(worker.ForkObj).coefficient);
    if (Number.isNaN(coefficient)) {
      return 0;
    }
    return coefficient;
  }
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

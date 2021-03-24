import { log } from '@kot-shrodingera-team/germes-utils';
import { defaultNumberRegex, defaultRemoveRegex } from './defaultRegexes';

/**
 * Генератор функции получения текущей суммы в купоне
 * @param options Опции:
 * - sumInputSelector - Селектор элемента ввода суммы в купоне
 * - zeroValues - Массив текстовых значений суммы в купоне, которые расцениваются как 0
 * - replaceDataArray - Массив заменяемых значений в тексте элемента ввода суммы в купоне
 * -- searchValue - Искомое значение
 * -- replaceValue - Значение, на которое заменяется
 * - removeRegex - Регулярное выражение для удаления символов из текста элемента ввода суммы в купоне, по умолчанию /[\s,']/g;
 * - currentSumRegex - Регулярное выражение для получения значения текущей суммы в купоне из полученного текста, по умолчанию /(\d+(?:\.\d+)?)/
 * - context - Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
 * @returns Функция, которая возвращает текущую сумму в купоне
 */
const getCurrentSumGenerator = (options: {
  sumInputSelector: string;
  zeroValues?: string[];
  replaceDataArray?: {
    searchValue: string | RegExp;
    replaceValue: string;
  }[];
  removeRegex?: RegExp;
  currentSumRegex?: RegExp;
  context?: () => Document | Element;
}) => (): number => {
  const context = options.context ? options.context() : document;
  const sumInputElement = context.querySelector<HTMLInputElement>(
    options.sumInputSelector
  );
  if (!sumInputElement) {
    log('Не найдено поле ввода суммы ставки', 'crimson');
    return 0;
  }
  let sumInputText = sumInputElement.value.trim();
  if (sumInputText === '') {
    return 0;
  }
  if (options.zeroValues && options.zeroValues.includes(sumInputText)) {
    return 0;
  }
  if (options.replaceDataArray) {
    options.replaceDataArray.forEach((replaceData) => {
      sumInputText = sumInputText.replace(
        replaceData.searchValue,
        replaceData.replaceValue
      );
    });
  }
  const removeRegex = options.removeRegex
    ? options.removeRegex
    : defaultRemoveRegex;
  sumInputText = sumInputText.replace(removeRegex, '');
  const currentSumRegex = options.currentSumRegex
    ? options.currentSumRegex
    : defaultNumberRegex;
  const sumMatch = sumInputText.match(currentSumRegex);
  if (!sumMatch) {
    log(`Непонятный формат текущей суммы ставки: "${sumInputText}"`, 'crimson');
    return 0;
  }
  return Number(sumMatch[1]);
};

export default getCurrentSumGenerator;

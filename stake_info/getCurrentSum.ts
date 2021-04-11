import { getWorkerParameter, log } from '@kot-shrodingera-team/germes-utils';
import { defaultNumberRegex, defaultRemoveRegex } from './defaultRegexes';

/**
 * Опции генератора функции получения текущей суммы в купоне
 */
interface GetCurrentSumGeneratorOptions {
  /**
   * Селектор элемента ввода суммы в купоне
   */
  sumInputSelector: string;
  /**
   * Массив текстовых значений суммы в купоне, которые расцениваются как 0
   */
  zeroValues?: string[];
  /**
   * Заменяемые подстроки в тексте элемента ввода суммы в купоне
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
   * Регулярное выражение для удаления символов из текста элемента ввода суммы в купоне, по умолчанию /[\s,']/g;
   */
  removeRegex?: RegExp;
  /**
   * Регулярное выражение для получения значения суммы в купоне из полученного текста, по умолчанию /(\d+(?:\.\d+)?)/
   */
  currentSumRegex?: RegExp;
  /**
   * Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
   */
  context?: () => Document | Element;
}

/**
 * Генератор функции получения текущей суммы в купоне
 * @returns Функция, которая возвращает текущую сумму в купоне
 */
const getCurrentSumGenerator = (
  options: GetCurrentSumGeneratorOptions
) => (): number => {
  if (
    getWorkerParameter('fakeCurrentSum', 'number') ||
    getWorkerParameter('fakeOpenStake')
  ) {
    const fakeCurrentSum = getWorkerParameter(
      'fakeCurrentSum',
      'number'
    ) as number;
    if (fakeCurrentSum !== undefined) {
      return fakeCurrentSum;
    }
    return 0;
  }
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

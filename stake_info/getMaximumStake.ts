import { log, awaiter } from '@kot-shrodingera-team/germes-utils';
import { defaultRemoveRegex, defaultNumberRegex } from './defaultRegexes';

/**
 * Генератор функции ожидания появления максимальной ставки
 * @param options Опции:
 * - maximumStakeSelector - Селектор элемента максимальной ставки
 * - replaceDataArray - Массив заменяемых значений в тексте элемента максимальной ставки
 * -- searchValue - Искомое значение
 * -- replaceValue - Значение, на которое заменяется
 * - removeRegex - Регулярное выражение для удаления символов из текста элемента максимальной ставки, по умолчанию /[\s,']/g;
 * - maximumStakeRegex - Регулярное выражение для получения значения максимальной ставки из полученного текста, по умолчанию /(\d+(?:\.\d+)?)/
 * - context - Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
 * @returns Асинхронная функция, которая возвращает true, если появилась максимальная ставка, иначе false
 * - timeout - Таймаут проверки, по умолчанию 5000
 * - interval - Интервал проверки, по умолчанию 100
 */
export const maximumStakeReadyGenerator = (options: {
  maximumStakeSelector: string;
  replaceDataArray?: {
    searchValue: string | RegExp;
    replaceValue: string;
  }[];
  removeRegex?: RegExp;
  maximumStakeRegex?: RegExp;
  context?: () => Document | Element;
}) => async (timeout = 5000, interval = 100): Promise<boolean> => {
  const context = options.context ? options.context() : document;
  const maximumStakeLoaded = Boolean(
    await awaiter(
      () => {
        const maximumStakeElement = context.querySelector(
          options.maximumStakeSelector
        );
        if (!maximumStakeElement) {
          return false;
        }
        let maximumStakeText = maximumStakeElement.textContent.trim();
        if (options.replaceDataArray) {
          options.replaceDataArray.forEach((replaceData) => {
            maximumStakeText = maximumStakeText.replace(
              replaceData.searchValue,
              replaceData.replaceValue
            );
          });
        }
        const removeRegex = options.removeRegex
          ? options.removeRegex
          : defaultRemoveRegex;
        maximumStakeText = maximumStakeText.replace(removeRegex, '');
        const maximumStakeRegex = options.maximumStakeRegex
          ? options.maximumStakeRegex
          : defaultNumberRegex;
        const maximumStakeMatch = maximumStakeText.match(maximumStakeRegex);
        return Boolean(maximumStakeMatch);
      },
      timeout,
      interval
    )
  );
  return maximumStakeLoaded;
};

/**
 * Генератор функции получения максимальной ставки
 * @param options Опции:
 * - maximumStakeSelector - Селектор элемента максимальной ставки
 * - replaceDataArray - Массив заменяемых значений в тексте элемента максимальной ставки
 * -- searchValue - Искомое значение
 * -- replaceValue - Значение, на которое заменяется
 * - removeRegex - Регулярное выражение для удаления символов из текста элемента максимальной ставки, по умолчанию /[\s,']/g;
 * - maximumStakeRegex - Регулярное выражение для получения значения максимальной ставки из полученного текста, по умолчанию /(\d+(?:\.\d+)?)/
 * - context - Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
 * - disableLog - Отключение вывода логов, по умолчанию false
 * @returns Функция, которая возвращает максимальную ставку
 */
const getMaximumStakeGenerator = (options: {
  maximumStakeSelector: string;
  replaceDataArray?: {
    searchValue: string | RegExp;
    replaceValue: string;
  }[];
  removeRegex?: RegExp;
  maximumStakeRegex?: RegExp;
  context?: () => Document | Element;
  disableLog?: boolean;
}) => (): number => {
  const context = options.context ? options.context() : document;
  const maximumStakeElement = context.querySelector(
    options.maximumStakeSelector
  );
  if (!maximumStakeElement) {
    if (options.disableLog !== true) {
      log('Не найдена максимальная сумма ставки', 'crimson');
    }
    return 0;
  }
  let maximumStakeText = maximumStakeElement.textContent.trim();
  if (options.replaceDataArray) {
    options.replaceDataArray.forEach((replaceData) => {
      maximumStakeText = maximumStakeText.replace(
        replaceData.searchValue,
        replaceData.replaceValue
      );
    });
  }
  const removeRegex = options.removeRegex
    ? options.removeRegex
    : defaultRemoveRegex;
  maximumStakeText = maximumStakeText.replace(removeRegex, '');
  const maximumStakeRegex = options.maximumStakeRegex
    ? options.maximumStakeRegex
    : defaultNumberRegex;
  const maximumStakeMatch = maximumStakeText.match(maximumStakeRegex);
  if (!maximumStakeMatch) {
    if (options.disableLog !== true) {
      log(
        `Непонятный формат максимальной ставки: "${maximumStakeText}"`,
        'crimson'
      );
    }
    return 0;
  }
  return Number(maximumStakeMatch[1]);
};

export default getMaximumStakeGenerator;

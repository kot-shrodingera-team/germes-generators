import { log, awaiter } from '@kot-shrodingera-team/germes-utils';
import { defaultRemoveRegex, defaultNumberRegex } from './defaultRegexes';

/**
 * Генератор функции ожидания появления минимальной ставки
 * @param options Опции:
 * - minimumStakeSelector - Селектор элемента минимальной ставки
 * - replaceDataArray - Массив заменяемых значений в тексте элемента минимальной ставки
 * -- searchValue - Искомое значение
 * -- replaceValue - Значение, на которое заменяется
 * - removeRegex - Регулярное выражение для удаления символов из текста элемента минимальной ставки, по умолчанию /[\s,']/g;
 * - minimumStakeRegex - Регулярное выражение для получения значения минимальной ставки из полученного текста, по умолчанию /(\d+(?:\.\d+)?)/
 * - context - Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
 * - disableLog - Отключение вывода логов, по умолчанию false
 * @returns Асинхронная функция, которая возвращает true, если появилась минимальная ставка, иначе false
 * - timeout - Таймаут проверки, по умолчанию 5000
 * - interval - Интервал проверки, по умолчанию 100
 */
export const minimumStakeReadyGenerator = (options: {
  minimumStakeSelector: string;
  replaceDataArray?: {
    searchValue: string | RegExp;
    replaceValue: string;
  }[];
  removeRegex?: RegExp;
  minimumStakeRegex?: RegExp;
  context?: () => Document | Element;
}) => async (timeout = 5000, interval = 100): Promise<boolean> => {
  const context = options.context ? options.context() : document;
  const minimumStakeLoaded = Boolean(
    await awaiter(
      () => {
        const minimumStakeElement = context.querySelector(
          options.minimumStakeSelector
        );
        if (!minimumStakeElement) {
          return false;
        }
        let minimumStakeText = minimumStakeElement.textContent.trim();
        if (options.replaceDataArray) {
          options.replaceDataArray.forEach((replaceData) => {
            minimumStakeText = minimumStakeText.replace(
              replaceData.searchValue,
              replaceData.replaceValue
            );
          });
        }
        const removeRegex = options.removeRegex
          ? options.removeRegex
          : defaultRemoveRegex;
        minimumStakeText = minimumStakeText.replace(removeRegex, '');
        const minimumStakeRegex = options.minimumStakeRegex
          ? options.minimumStakeRegex
          : defaultNumberRegex;
        const minimumStakeMatch = minimumStakeText.match(minimumStakeRegex);
        return Boolean(minimumStakeMatch);
      },
      timeout,
      interval
    )
  );
  return minimumStakeLoaded;
};

/**
 * Генератор функции получения минимальной ставки
 * @param options Опции:
 * - minimumStakeSelector - Селектор элемента минимальной ставки
 * - replaceDataArray - Массив заменяемых значений в тексте элемента минимальной ставки
 * -- searchValue - Искомое значение
 * -- replaceValue - Значение, на которое заменяется
 * - removeRegex - Регулярное выражение для удаления символов из текста элемента минимальной ставки, по умолчанию /[\s,']/g;
 * - minimumStakeRegex - Регулярное выражение для получения значения минимальной ставки из полученного текста, по умолчанию /(\d+(?:\.\d+)?)/
 * - context - Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
 * @returns Функция, которая возвращает минимальную ставку
 */
const getMinimumStakeGenerator = (options: {
  minimumStakeSelector: string;
  replaceDataArray?: {
    searchValue: string | RegExp;
    replaceValue: string;
  }[];
  removeRegex?: RegExp;
  minimumStakeRegex?: RegExp;
  context?: () => Document | Element;
  disableLog?: boolean;
}) => (): number => {
  const context = options.context ? options.context() : document;
  const minimumStakeElement = context.querySelector(
    options.minimumStakeSelector
  );
  if (!minimumStakeElement) {
    if (options.disableLog !== true) {
      log('Не найдена минимальная сумма ставки', 'crimson');
    }
    return 0;
  }
  let minimumStakeText = minimumStakeElement.textContent.trim();
  if (options.replaceDataArray) {
    options.replaceDataArray.forEach((replaceData) => {
      minimumStakeText = minimumStakeText.replace(
        replaceData.searchValue,
        replaceData.replaceValue
      );
    });
  }
  const removeRegex = options.removeRegex
    ? options.removeRegex
    : defaultRemoveRegex;
  minimumStakeText = minimumStakeText.replace(removeRegex, '');
  const minimumStakeRegex = options.minimumStakeRegex
    ? options.minimumStakeRegex
    : defaultNumberRegex;
  const minimumStakeMatch = minimumStakeText.match(minimumStakeRegex);
  if (!minimumStakeMatch) {
    if (options.disableLog !== true) {
      log(
        `Непонятный формат маинимальной ставки: "${minimumStakeText}"`,
        'crimson'
      );
    }
    return 0;
  }
  return Number(minimumStakeMatch[1]);
};

export default getMinimumStakeGenerator;

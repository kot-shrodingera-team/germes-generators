import { awaiter, log } from '@kot-shrodingera-team/germes-utils';
import { defaultRemoveRegex, defaultNumberRegex } from './defaultRegexes';

/**
 * Генератор функции ожидания появления баланса
 * @param options Опции:
 * - balanceSelector - Селектор элемента баланса
 * - replaceDataArray - Массив заменяемых значений в тексте элемента баланса
 * -- searchValue - Искомое значение
 * -- replaceValue - Значение, на которое заменяется
 * - removeRegex - Регулярное выражение для удаления символов из текста элемента баланса, по умолчанию /[\s,']/g;
 * - balanceRegex - Регулярное выражение для получения значения баланса из полученного текста, по умолчанию /(\d+(?:\.\d+)?)/
 * - context - Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
 * @returns Асинхронная функция, которая возвращает true, если появился баланс, иначе false
 * - timeout - Таймаут проверки, по умолчанию 5000
 * - interval - Интервал проверки, по умолчанию 100
 */
export const balanceReadyGenerator = (options: {
  balanceSelector: string;
  replaceDataArray?: {
    searchValue: string | RegExp;
    replaceValue: string;
  }[];
  removeRegex?: RegExp;
  balanceRegex?: RegExp;
  context?: () => Document | Element;
}) => async (timeout = 5000, interval = 100): Promise<boolean> => {
  const context = options.context ? options.context() : document;
  const balanceLoaded = Boolean(
    await awaiter(
      () => {
        const balanceElement = context.querySelector(options.balanceSelector);
        if (!balanceElement) {
          return false;
        }
        let balanceText = balanceElement.textContent.trim();
        if (options.replaceDataArray) {
          options.replaceDataArray.forEach((replaceData) => {
            balanceText = balanceText.replace(
              replaceData.searchValue,
              replaceData.replaceValue
            );
          });
        }
        const removeRegex = options.removeRegex
          ? options.removeRegex
          : defaultRemoveRegex;
        balanceText = balanceText.replace(removeRegex, '');
        const balanceRegex = options.balanceRegex
          ? options.balanceRegex
          : defaultNumberRegex;
        const balanceMatch = balanceText.match(balanceRegex);
        return Boolean(balanceMatch);
      },
      timeout,
      interval
    )
  );
  return balanceLoaded;
};

/**
 * Генератор функции получения баланса
 * @param options Опции:
 * - balanceSelector - Селектор элемента баланса
 * - replaceDataArray - Массив заменяемых значений в тексте элемента баланса
 * -- searchValue - Искомое значение
 * -- replaceValue - Значение, на которое заменяется
 * - removeRegex - Регулярное выражение для удаления символов из текста элемента баланса, по умолчанию /[\s,']/g;
 * - balanceRegex - Регулярное выражение для получения значения баланса из полученного текста, по умолчанию /(\d+(?:\.\d+)?)/
 * - context - Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
 * @returns Функция, которая возвращает баланс
 */
export const getBalanceGenerator = (options: {
  balanceSelector: string;
  replaceDataArray?: {
    searchValue: string | RegExp;
    replaceValue: string;
  }[];
  removeRegex?: RegExp;
  balanceRegex?: RegExp;
  context?: () => Document | Element;
}) => (): number => {
  const context = options.context ? options.context() : document;
  const balanceElement = context.querySelector<HTMLElement>(
    options.balanceSelector
  );
  if (!balanceElement) {
    log('Баланс не найден', 'crimson');
    return 0;
  }
  let balanceText = balanceElement.textContent.trim();
  if (options.replaceDataArray) {
    options.replaceDataArray.forEach((replaceData) => {
      balanceText = balanceText.replace(
        replaceData.searchValue,
        replaceData.replaceValue
      );
    });
  }
  const removeRegex = options.removeRegex
    ? options.removeRegex
    : defaultRemoveRegex;
  balanceText = balanceText.replace(removeRegex, '');
  const balanceRegex = options.balanceRegex
    ? options.balanceRegex
    : defaultNumberRegex;
  const balanceMatch = balanceText.match(balanceRegex);
  if (!balanceMatch) {
    log(`Непонятный формат баланса: "${balanceText}"`, 'crimson');
    return 0;
  }
  return Number(balanceMatch[1]);
};

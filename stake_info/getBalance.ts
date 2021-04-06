import {
  awaiter,
  getWorkerParameter,
  log,
} from '@kot-shrodingera-team/germes-utils';
import { defaultRemoveRegex, defaultNumberRegex } from './defaultRegexes';

/**
 * Опции генератора функции ожидания появления баланса
 */
interface BalanceReadyGeneratorOptions {
  /**
   * Селектор элемента баланса
   */
  balanceSelector: string;
  /**
   * Заменяемые подстроки в тексте элемента баланса
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
   * Регулярное выражение для удаления символов из текста элемента баланса, по умолчанию /[\s,']/g;
   */
  removeRegex?: RegExp;
  /**
   * Регулярное выражение для получения значения баланса из полученного текста, по умолчанию /(\d+(?:\.\d+)?)/
   */
  balanceRegex?: RegExp;
  /**
   * Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
   */
  context?: () => Document | Element;
}

/**
 * Генератор функции ожидания появления баланса
 * @returns Асинхронная функция, которая возвращает true, если появился баланс, иначе false
 * - timeout - Таймаут проверки, по умолчанию 5000
 * - interval - Интервал проверки, по умолчанию 100
 */
export const balanceReadyGenerator = (
  options: BalanceReadyGeneratorOptions
) => async (timeout = 5000, interval = 100): Promise<boolean> => {
  if (getWorkerParameter('fakeBalance') || getWorkerParameter('fakeAuth')) {
    return true;
  }
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
 * Опции генератора функции получения баланса
 */
interface GetBalanceGeneratorOptions {
  /**
   * Селектор элемента баланса
   */
  balanceSelector: string;
  /**
   * Заменяемые подстроки в тексте элемента баланса
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
   * Регулярное выражение для удаления символов из текста элемента баланса, по умолчанию /[\s,']/g;
   */
  removeRegex?: RegExp;
  /**
   * Регулярное выражение для получения значения баланса из полученного текста, по умолчанию /(\d+(?:\.\d+)?)/
   */
  balanceRegex?: RegExp;
  /**
   * Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
   */
  context?: () => Document | Element;
}

/**
 * Генератор функции получения баланса
 * @returns Функция, которая возвращает баланс
 */
export const getBalanceGenerator = (
  options: GetBalanceGeneratorOptions
) => (): number => {
  if (getWorkerParameter('fakeBalance') || getWorkerParameter('fakeAuth')) {
    const fakeBalance = getWorkerParameter('fakeBalance');
    if (typeof fakeBalance === 'number') {
      return fakeBalance;
    }
    return 100000;
  }
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

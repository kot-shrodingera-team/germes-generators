import {
  log,
  awaiter,
  getWorkerParameter,
} from '@kot-shrodingera-team/germes-utils';
import { defaultRemoveRegex, defaultNumberRegex } from './defaultRegexes';

/**
 * Опции генератора функции ожидания появления минимальной ставки
 */
interface MinimumStakeReadyGeneratorOptions {
  /**
   * Селектор элемента минимальной ставки
   */
  minimumStakeSelector: string;
  /**
   * Заменяемые подстроки в тексте элемента минимальной ставки
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
   * Регулярное выражение для удаления символов из текста элемента минимальной ставки, по умолчанию /[\s,']/g;
   */
  removeRegex?: RegExp;
  /**
   * Регулярное выражение для получения значения минимальной ставки из полученного текста, по умолчанию /(\d+(?:\.\d+)?)/
   */
  minimumStakeRegex?: RegExp;
  /**
   * Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
   */
  context?: () => Document | Element;
}

/**
 * Генератор функции ожидания появления минимальной ставки
 * @returns Асинхронная функция, которая возвращает true, если появилась минимальная ставка, иначе false
 * - timeout - Таймаут проверки, по умолчанию 5000
 * - interval - Интервал проверки, по умолчанию 100
 */
export const minimumStakeReadyGenerator = (
  options: MinimumStakeReadyGeneratorOptions
) => async (timeout = 5000, interval = 100): Promise<boolean> => {
  if (
    getWorkerParameter('fakeMinimumStake') ||
    getWorkerParameter('fakeAuth')
  ) {
    return true;
  }
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
 * Опции генератора функции получения минимальной ставки
 */
interface GetMinimumStakeGeneratorOptions {
  /**
   * Селектор элемента минимальной ставки
   */
  minimumStakeSelector: string;
  /**
   * Заменяемые подстроки в тексте элемента минимальной ставки
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
   * Регулярное выражение для удаления символов из текста элемента минимальной ставки, по умолчанию /[\s,']/g;
   */
  removeRegex?: RegExp;
  /**
   * Регулярное выражение для получения значения минимальной ставки из полученного текста, по умолчанию /(\d+(?:\.\d+)?)/
   */
  minimumStakeRegex?: RegExp;
  /**
   * Флаг отключения вывода логов, по умолчанию false
   */
  disableLog?: boolean;
  /**
   * Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
   */
  context?: () => Document | Element;
}

/**
 * Генератор функции получения минимальной ставки

 * @returns Функция, которая возвращает минимальную ставку
 */
const getMinimumStakeGenerator = (
  options: GetMinimumStakeGeneratorOptions
) => (): number => {
  if (
    getWorkerParameter('fakeMinimumStake') ||
    getWorkerParameter('fakeAuth')
  ) {
    const fakeMinimumStake = getWorkerParameter('fakeMinimumStake');
    if (typeof fakeMinimumStake === 'number') {
      return fakeMinimumStake;
    }
    return 100000;
  }
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

import {
  log,
  awaiter,
  getWorkerParameter,
} from '@kot-shrodingera-team/germes-utils';
import { defaultRemoveRegex, defaultNumberRegex } from './defaultRegexes';

/**
 * Опции генератора функции ожидания появления максимальной ставки
 */
interface MaximumStakeReadyGeneratorOptions {
  /**
   * Селектор элемента максимальной ставки
   */
  maximumStakeSelector: string;
  /**
   * Заменяемые подстроки в тексте элемента максимальной ставки
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
   * Регулярное выражение для удаления символов из текста элемента максимальной ставки, по умолчанию /[\s,']/g;
   */
  removeRegex?: RegExp;
  /**
   * Регулярное выражение для получения значения максимальной ставки из полученного текста, по умолчанию /(\d+(?:\.\d+)?)/
   */
  maximumStakeRegex?: RegExp;
  /**
   * Имя параметра воркера, который включает фейковое определение максимальной ставки
   */
  fakeMaximumStakeWorkerParameterName?: string;
  /**
   * Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
   */
  context?: () => Document | Element;
}

/**
 * Генератор функции ожидания появления максимальной ставки
 * @returns Асинхронная функция, которая возвращает true, если появилась максимальная ставка, иначе false
 * - timeout - Таймаут проверки, по умолчанию 5000
 * - interval - Интервал проверки, по умолчанию 100
 */
export const maximumStakeReadyGenerator = (
  options: MaximumStakeReadyGeneratorOptions
) => async (timeout = 5000, interval = 100): Promise<boolean> => {
  if (
    options.fakeMaximumStakeWorkerParameterName &&
    getWorkerParameter(options.fakeMaximumStakeWorkerParameterName)
  ) {
    return true;
  }
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
 * Опции генератора функции получения максимальной ставки
 */
interface GetMaximumStakeGeneratorOptions {
  /**
   * Селектор элемента максимальной ставки
   */
  maximumStakeSelector: string;
  /**
   * Заменяемые подстроки в тексте элемента максимальной ставки
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
   * Регулярное выражение для удаления символов из текста элемента максимальной ставки, по умолчанию /[\s,']/g;
   */
  removeRegex?: RegExp;
  /**
   * Регулярное выражение для получения значения максимальной ставки из полученного текста, по умолчанию /(\d+(?:\.\d+)?)/
   */
  maximumStakeRegex?: RegExp;
  /**
   * Флаг отключения вывода логов, по умолчанию false
   */
  disableLog?: boolean;
  /**
   * Имя параметра воркера, который включает фейковое определение максимальной ставки
   */
  fakeMaximumStakeWorkerParameterName?: string;
  /**
   * Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
   */
  context?: () => Document | Element;
}

/**
 * Генератор функции получения максимальной ставки
 * @returns Функция, которая возвращает максимальную ставку
 */
const getMaximumStakeGenerator = (
  options: GetMaximumStakeGeneratorOptions
) => (): number => {
  if (
    options.fakeMaximumStakeWorkerParameterName &&
    getWorkerParameter(options.fakeMaximumStakeWorkerParameterName)
  ) {
    return Number(
      getWorkerParameter(options.fakeMaximumStakeWorkerParameterName)
    );
  }
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

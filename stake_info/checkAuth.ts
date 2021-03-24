import { getElement, log } from '@kot-shrodingera-team/germes-utils';

/**
 * Генератор функции ожидания готовности определения авторизации
 * @param options Опции:
 * - noAuthElementSelector - Селектор элемента отсутствия авторизации
 * - authElementSelector - Селектор элемента наличия авторизации
 * - maxDelayAfterNoAuthElementAppeared - Таймаут ожидания элемента наличия авторизации после появления элемента отсутствия авторизации, по умолчанию 0
 * - logging - вывод логов, по умолчанию true
 * - context - Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
 * @returns Асинхронная функция, которая возвращает true, если есть готовность определения авторизации, иначе false
 * - timeout - Таймаут проверки, по умолчанию 5000
 */
export const authStateReadyGenerator = (options: {
  noAuthElementSelector: string;
  authElementSelector: string;
  maxDelayAfterNoAuthElementAppeared?: number;
  logging?: boolean;
  context?: () => Document | Element;
}) => async (timeout = 5000): Promise<void> => {
  const context = options.context ? options.context() : document;
  await Promise.race([
    getElement(options.noAuthElementSelector, timeout, context),
    getElement(options.authElementSelector, timeout, context),
  ]);
  const noAuthElement = context.querySelector(options.noAuthElementSelector);
  const authElement = context.querySelector(options.authElementSelector);
  if (options.maxDelayAfterNoAuthElementAppeared && noAuthElement) {
    if (options.logging) {
      log(
        `Появился элемент отсутсвия авторизации, ожидаем элемент наличия авторизации`,
        'steelblue'
      );
    }
    const authElementWaited = await getElement(
      options.authElementSelector,
      options.maxDelayAfterNoAuthElementAppeared,
      context
    );
    if (options.logging) {
      if (authElementWaited) {
        log(`Появился элемент наличия авторизации`, 'steelblue');
      } else {
        log(`Элемент наличия авторизации не появился`, 'steelblue');
      }
    }
    return;
  }
  if (options.logging) {
    if (noAuthElement) {
      log(`Появился элемент отсутствия авторизации`, 'steelblue');
    } else if (authElement) {
      log(`Появился элемент наличия авторизации`, 'steelblue');
    } else {
      log(`Не найден элемент наличия или отсутствия авторизации`, 'steelblue');
    }
  }
};

/**
 * Генератор функции определения авторизации
 * @param options Опции:
 * - authElementSelector - Селектор элемента наличия авторизации
 * - context - Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
 * @returns Функция, которая возвращает true, если есть авторизация, иначе false
 */
const checkAuthGenerator = (options: {
  authElementSelector: string;
  context?: () => Document | Element;
}) => (): boolean => {
  const context = options.context ? options.context() : document;
  const accountMenu = context.querySelector(options.authElementSelector);
  return Boolean(accountMenu);
};

export default checkAuthGenerator;

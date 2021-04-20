import {
  getElement,
  getWorkerParameter,
  log,
} from '@kot-shrodingera-team/germes-utils';

/**
 * Опции генератора функции ожидания готовности определения авторизации
 */
interface AuthStateReadyGeneratorOptions {
  /**
   * Селектор элемента отсутствия авторизации
   */
  noAuthElementSelector: string;
  /**
   * Селектор элемента наличия авторизации
   */
  authElementSelector: string;
  /**
   * Таймаут ожидания элемента наличия авторизации после появления элемента отсутствия авторизации, по умолчанию 0
   *
   * Используется, если при загрузке страницы может появится элемент отсутствия авторизации,
   * и только через какое-то время элемент наличия авторизации
   */
  maxDelayAfterNoAuthElementAppeared?: number;
  /**
   * Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
   */
  context?: () => Document | Element;
}

/**
 * Генератор функции ожидания готовности определения авторизации
 *
 * Ожидает появления элемента наличия или отсутствия авторизации
 * @returns Асинхронная функция, которая возвращает true, если есть готовность определения авторизации, иначе false
 * - timeout - Таймаут проверки, по умолчанию 5000
 */
export const authStateReadyGenerator = (
  options: AuthStateReadyGeneratorOptions
) => async (timeout = 5000): Promise<void> => {
  if (getWorkerParameter('fakeAuth')) {
    return;
  }
  const context = options.context ? options.context() : document;
  await Promise.race([
    getElement(options.noAuthElementSelector, timeout, context),
    getElement(options.authElementSelector, timeout, context),
  ]);
  const noAuthElement = context.querySelector(options.noAuthElementSelector);
  const authElement = context.querySelector(options.authElementSelector);
  if (options.maxDelayAfterNoAuthElementAppeared && noAuthElement) {
    log(
      `Появился элемент отсутсвия авторизации, ожидаем элемент наличия авторизации`,
      'cadetblue',
      true
    );
    const authElementWaited = await getElement(
      options.authElementSelector,
      options.maxDelayAfterNoAuthElementAppeared,
      context
    );
    if (authElementWaited) {
      log(`Появился элемент наличия авторизации`, 'cadetblue', true);
    } else {
      log(`Элемент наличия авторизации не появился`, 'cadetblue', true);
    }
    return;
  }
  if (noAuthElement) {
    log(`Появился элемент отсутствия авторизации`, 'cadetblue', true);
  } else if (authElement) {
    log(`Появился элемент наличия авторизации`, 'cadetblue', true);
  } else {
    log(
      `Не найден элемент наличия или отсутствия авторизации`,
      'crimson',
      true
    );
  }
};

/**
 * Опции генератора функции определения авторизации
 */
interface CheckAuthGeneratorOptions {
  /**
   * Селектор элемента наличия авторизации
   */
  authElementSelector: string;
  /**
   * Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
   */
  context?: () => Document | Element;
}

/**
 * Генератор функции определения авторизации
 * @returns Функция, которая возвращает true, если есть авторизация, иначе false
 */
const checkAuthGenerator = (
  options: CheckAuthGeneratorOptions
) => (): boolean => {
  if (getWorkerParameter('fakeAuth')) {
    return true;
  }
  const context = options.context ? options.context() : document;
  const authElement = context.querySelector(options.authElementSelector);
  return Boolean(authElement);
};

export default checkAuthGenerator;

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
   * Имя параметра воркера, который включает фейковое определение авторизации
   */
  fakeAuthWorkerParameterName?: string;
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
  if (
    options.fakeAuthWorkerParameterName &&
    getWorkerParameter(options.fakeAuthWorkerParameterName)
  ) {
    return;
  }
  const context = options.context ? options.context() : document;
  await Promise.any([
    getElement(options.noAuthElementSelector, timeout, context),
    getElement(options.authElementSelector, timeout, context),
  ]);
  const noAuthElement = context.querySelector(options.noAuthElementSelector);
  const authElement = context.querySelector(options.authElementSelector);
  if (options.maxDelayAfterNoAuthElementAppeared && noAuthElement) {
    log(
      `Появился элемент отсутсвия авторизации, ожидаем элемент наличия авторизации`,
      'steelblue'
    );
    const authElementWaited = await getElement(
      options.authElementSelector,
      options.maxDelayAfterNoAuthElementAppeared,
      context
    );
    if (authElementWaited) {
      log(`Появился элемент наличия авторизации`, 'steelblue');
    } else {
      log(`Элемент наличия авторизации не появился`, 'steelblue');
    }
    return;
  }
  if (noAuthElement) {
    log(`Появился элемент отсутствия авторизации`, 'steelblue');
  } else if (authElement) {
    log(`Появился элемент наличия авторизации`, 'steelblue');
  } else {
    log(`Не найден элемент наличия или отсутствия авторизации`, 'steelblue');
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
   * Имя параметра воркера, который включает фейковое определение авторизации
   */
  fakeAuthWorkerParameterName?: string;
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
  if (
    options.fakeAuthWorkerParameterName &&
    getWorkerParameter(options.fakeAuthWorkerParameterName)
  ) {
    return true;
  }
  const context = options.context ? options.context() : document;
  const authElement = context.querySelector(options.authElementSelector);
  return Boolean(authElement);
};

export default checkAuthGenerator;

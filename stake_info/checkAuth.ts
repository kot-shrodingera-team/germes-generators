import { getElement, log } from '@kot-shrodingera-team/germes-utils';

export const authStateReadyGenerator = (options: {
  /**
   * Селектор элемента отсутствия авторизации, например, кнопка авторизации
   */
  noAuthElementSelector: string;
  /**
   * Селектор элемента наличия авторизации, например, кнопка аккаунта или баланс
   */
  authElementSelector: string;
  /**
   * Ожидание элемента наличия авторизации после появления элемента отсутствия авторизации
   */
  maxDelayAfterNoAuthElementAppeared?: number;
  /**
   * Включение логгирования
   */
  logging?: boolean;
  /**
   * Контекст поиска элементов
   */
  context?: Document | Element;
}) => async (timeout = 5000): Promise<void> => {
  const context = options.context ? options.context : document;
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

const checkAuthGenerator = (options: {
  authElementSelector: string;
  context?: Document | Element;
}) => (): boolean => {
  const context = options.context ? options.context : document;
  const accountMenu = context.querySelector(options.authElementSelector);
  return Boolean(accountMenu);
};

export default checkAuthGenerator;

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
  logging: boolean;
}) => async (timeout = 5000): Promise<void> => {
  await Promise.race([
    getElement(options.noAuthElementSelector, timeout),
    getElement(options.authElementSelector, timeout),
  ]);
  const noAuthElement = document.querySelector(options.noAuthElementSelector);
  const authElement = document.querySelector(options.authElementSelector);
  if (options.maxDelayAfterNoAuthElementAppeared && noAuthElement) {
    if (options.logging) {
      log(
        `Появился элемент отсутсвия авторизации, ожидаем элемент наличия авторизации`,
        'steelblue'
      );
    }
    const authElementWaited = await getElement(
      options.authElementSelector,
      options.maxDelayAfterNoAuthElementAppeared
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
}) => (): boolean => {
  const accountMenu = document.querySelector(options.authElementSelector);
  return Boolean(accountMenu);
};

export default checkAuthGenerator;

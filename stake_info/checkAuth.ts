import { getElement } from '@kot-shrodingera-team/germes-utils';

export const authStateReadyGenerator = (options: {
  /**
   * Селектор элемента отсутствия авторизации, например, кнопка авторизации
   */
  noAuthSelector: string;
  /**
   * Селектор элемента наличия авторизации, например, кнопка аккаунта или баланс
   */
  authSelector: string;
  /**
   * Ожидание элемента наличия авторизации после появления элемента отсутствия авторизации
   */
  maxDelayAfterNoAuth?: number;
}) => async (timeout = 5000): Promise<void> => {
  await Promise.race([
    getElement(options.noAuthSelector, timeout),
    getElement(options.authSelector, timeout),
  ]);
  if (
    options.maxDelayAfterNoAuth &&
    document.querySelector(options.noAuthSelector)
  ) {
    await getElement(options.authSelector, options.maxDelayAfterNoAuth);
  }
};

const checkAuthGenerator = (options: {
  authSelector: string;
}) => (): boolean => {
  const accountMenu = document.querySelector(options.authSelector);
  return Boolean(accountMenu);
};

export default checkAuthGenerator;

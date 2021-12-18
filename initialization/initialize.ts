import { log } from '@kot-shrodingera-team/germes-utils';

/**
 * Опции генератора функции проверки и вызова авторизации
 */
interface InitializeGeneratorOptions {
  /**
   * Функция ожидания готовности определения авторизации
   */
  authStateReady: (timeout?: number) => Promise<void>;
  /**
   * Таймаут функции ожидания готовности определения авторизации
   */
  authStateReadyTimeout?: number;
  /**
   * Функция проверки наличия авторизации
   */
  checkAuth: () => boolean;
  /**
   * Функция ожидания появления баланса
   */
  balanceReady: () => Promise<boolean>;
  /**
   * Функция обновления баланса в боте
   */
  updateBalance: () => void;
  /**
   * Функция авторизации на сайте бк
   */
  authorize: () => Promise<void>;
  /**
   * Функция, выполняющася после успешной авторизации
   */
  afterSuccesfulLogin?: () => Promise<void>;
}

/**
 * Генератор функции проверки и вызова авторизации
 */
const initializeGenerator =
  (options: InitializeGeneratorOptions) => async (): Promise<void> => {
    if (worker.LoginTry > 3) {
      log('Превышен лимит попыток авторизации', 'crimson');
      return;
    }
    const timeout = options.authStateReadyTimeout
      ? options.authStateReadyTimeout
      : 5000;
    await options.authStateReady(timeout);
    worker.Islogin = options.checkAuth();
    worker.JSLogined();
    if (worker.Islogin) {
      log('Есть авторизация', 'green');
      worker.Islogin = true;
      worker.JSLogined();
      const balanceLoaded = await options.balanceReady();
      if (!balanceLoaded) {
        log(`Баланс не появился`, 'crimson');
      } else {
        options.updateBalance();
      }
      if (options.afterSuccesfulLogin) {
        options.afterSuccesfulLogin();
      }
    } else {
      options.authorize();
    }
  };

export default initializeGenerator;

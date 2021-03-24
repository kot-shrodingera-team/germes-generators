import { log } from '@kot-shrodingera-team/germes-utils';

/**
 * Генератор функции проверка авторизации и вызова авторизации, если нужно
 * @param options Опции:
 * - authStateReady - Функция ожидания готовности определения авторизации
 * - authStateReadyTimeout - Таймаут функции ожидания готовности определения авторизации
 * - checkAuth - Функция проверки наличия авторизации
 * - balanceReady - Функция ожидания появления баланса
 * - updateBalance - Функция обновления баланса в боте
 * - authorize - Функция авторизации на сайте бк
 * - afterSuccesfulLogin - Функция, выполняющася после успешной авторизации
 */
const initializeGenerator = (options: {
  authStateReady: (timeout?: number) => Promise<void>;
  authStateReadyTimeout?: number;
  checkAuth: () => boolean;
  balanceReady: () => Promise<boolean>;
  updateBalance: () => void;
  authorize: () => Promise<void>;
  afterSuccesfulLogin?: () => Promise<void>;
}) => async (): Promise<void> => {
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

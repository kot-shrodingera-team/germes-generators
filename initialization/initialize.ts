import { log } from '@kot-shrodingera-team/germes-utils';

const initializeGenerator = (options: {
  authCheckReady: (timeout?: number) => Promise<void>;
  checkAuth: () => boolean;
  balanceReady: () => Promise<boolean>;
  updateBalance: () => void;
  authorize: () => Promise<void>;
  ifLoginOk?: () => Promise<void>;
}) => async (): Promise<void> => {
  if (worker.LoginTry > 3) {
    log('Превышен лимит попыток авторизации', 'crimson');
    return;
  }

  await options.authCheckReady();
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
    if (options.ifLoginOk) {
      options.ifLoginOk();
    }
  } else {
    options.authorize();
  }
};

export default initializeGenerator;

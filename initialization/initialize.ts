import { log } from '@kot-shrodingera-team/germes-utils';

const initializeGenerator = (
  authCheckReady: () => Promise<void>,
  checkAuth: (timeout?: number) => boolean,
  balanceReady: () => Promise<boolean>,
  updateBalance: () => void,
  authorize: () => Promise<void>,
  ifLoginOk?: () => Promise<void>
) => async (): Promise<void> => {
  if (worker.LoginTry > 3) {
    log('Превышен лимит попыток авторизации', 'crimson');
    return;
  }

  await authCheckReady();
  worker.Islogin = checkAuth();
  worker.JSLogined();
  if (worker.Islogin) {
    log('Есть авторизация', 'green');
    worker.Islogin = true;
    worker.JSLogined();
    const balanceLoaded = await balanceReady();
    if (!balanceLoaded) {
      log(`Баланс не появился`, 'crimson');
    } else {
      updateBalance();
    }
    if (ifLoginOk) {
      ifLoginOk();
    }
  } else {
    authorize();
  }
};

export default initializeGenerator;

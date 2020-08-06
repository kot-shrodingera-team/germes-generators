import {
  getElement,
  log,
  getPhoneCountry,
  sleep,
  fireEvent,
} from '@kot-shrodingera-team/germes-utils';

export const initializeGenerator = (
  authCheckReady: () => Promise<void>,
  checkAuth: () => boolean,
  balanceReady: () => Promise<boolean>,
  updateBalance: () => void,
  authorize: () => Promise<void>
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
    return;
  }
  authorize();
};

export const authCheckReadyGenerator = (options: {
  authFormSelector: string;
  accountSelector: string;
}) => async (timeout = 5000): Promise<void> => {
  await Promise.race([
    getElement(options.authFormSelector, timeout),
    getElement(options.accountSelector, timeout),
  ]);
};

export const authorizeGenerator = (options: {
  openForm?: {
    selector: string;
    openedSelector: string;
    afterOpenDelay?: number;
  };
  phoneLogin?: {
    changeToPhoneLogin: () => Promise<boolean>;
    phoneInputSelector?: string;
  };
  loginInputSelector: string;
  passwordInputSelector: string;
  submitButtonSelector: string;
  beforeSubmitDelay?: number;
  captchaSelector?: string;
  loginedWait?: {
    loginedSelector: string;
    updateBalance: () => void;
  };
}) => async (): Promise<void> => {
  if (options.openForm) {
    const loopCount = 10;
    for (let i = 1; i <= loopCount; i += 1) {
      const openLoginFormButton = document.querySelector(
        options.openForm.selector
      ) as HTMLButtonElement;
      if (!openLoginFormButton) {
        log('Не найдена кнопка открытия формы авторизации', 'crimson');
        return;
      }
      openLoginFormButton.click();
      // eslint-disable-next-line no-await-in-loop
      const authForm = await getElement(options.openForm.openedSelector, 500);
      if (!authForm) {
        if (i === loopCount) {
          log('Форма авторизации так и не появилась', 'crimson');
          return;
        }
        log('Форма авторизации не появилась. Пробуем ещё раз', 'steelblue');
      } else {
        break;
      }
    }
    if (options.openForm.afterOpenDelay) {
      await sleep(options.openForm.afterOpenDelay);
    }
  }

  if (options.phoneLogin) {
    const phoneCountry = getPhoneCountry();
    if (phoneCountry) {
      log('Используется номер телефона', 'steelblue');
      const changedToPhoneLogin = await options.phoneLogin.changeToPhoneLogin();
      if (!changedToPhoneLogin) {
        log('Не удалось переключиться на вход по телефону', 'crimson');
        return;
      }
    }
  }
  const loginInput = (await getElement(
    options.phoneLogin.phoneInputSelector
      ? options.phoneLogin.phoneInputSelector
      : options.loginInputSelector
  )) as HTMLInputElement;
  if (!loginInput) {
    log('Не найдено поле ввода логина');
    return;
  }
  loginInput.value = worker.Login;
  fireEvent(loginInput, 'input');
  const passwordInput = (await getElement(
    options.passwordInputSelector
  )) as HTMLInputElement;
  if (!passwordInput) {
    log('Не найдено поле ввода пароля', 'crimson');
    return;
  }
  passwordInput.value = worker.Password;
  fireEvent(passwordInput, 'input');
  const loginSubmitButton = (await getElement(
    options.submitButtonSelector
  )) as HTMLButtonElement;
  if (!loginSubmitButton) {
    log('Не найдена кнопка входа', 'crimson');
    return;
  }
  if (options.beforeSubmitDelay) {
    await sleep(options.beforeSubmitDelay);
  }
  log('Нажимаем на кнопку входа', 'orange');
  loginSubmitButton.click();
  worker.LoginTry += 1;

  if (options.captchaSelector) {
    getElement(options.captchaSelector).then((element) => {
      if (element) {
        log('Появилась капча', 'orange');
      }
    });
  }

  if (options.loginedWait) {
    const logined = await getElement(options.loginedWait.loginedSelector);
    if (!logined) {
      log('Авторизация не удалась', 'crimson');
      return;
    }
    log('Авторизация успешна', 'green');
    worker.Islogin = true;
    worker.JSLogined();
    options.loginedWait.updateBalance();
  }
};

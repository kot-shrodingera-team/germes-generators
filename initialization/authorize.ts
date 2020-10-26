import {
  getElement,
  log,
  sleep,
  fireEvent,
  nativeInput,
} from '@kot-shrodingera-team/germes-utils';
import { setReactInputValue } from '@kot-shrodingera-team/germes-utils/reactUtils';

const authorizeGenerator = (options: {
  openForm?: {
    selector: string;
    openedSelector: string;
    afterOpenDelay?: number;
  };
  setLoginType?: () => Promise<boolean>;
  loginInputSelector: string;
  passwordInputSelector: string;
  submitButtonSelector: string;
  inputType?: 'fireEvent' | 'react' | 'nativeInput';
  beforeSubmitDelay?: number;
  captchaSelector?: string;
  loginedWait?: {
    loginedSelector: string;
    balanceReady: () => Promise<boolean>;
    updateBalance: () => void;
  };
  afterSuccesfulLogin?: () => Promise<void>;
  context?: () => Document | Element;
}) => async (): Promise<void> => {
  const context = options.context ? options.context() : document;
  if (options.openForm) {
    const loopCount = 10;
    for (let i = 1; i <= loopCount; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const openLoginFormButton = (await getElement(
        options.openForm.selector,
        1000,
        context
      )) as HTMLButtonElement;
      if (!openLoginFormButton) {
        log('Не найдена кнопка открытия формы авторизации', 'crimson');
        return;
      }
      openLoginFormButton.click();
      // eslint-disable-next-line no-await-in-loop
      const authForm = await getElement(
        options.openForm.openedSelector,
        500,
        context
      );
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

  if (options.setLoginType) {
    const loginTypeSet = await options.setLoginType();
    if (!loginTypeSet) {
      log('Не удалось переключиться на вход по нужному типу логина', 'crimson');
      return;
    }
  }
  const loginInput = (await getElement(
    options.loginInputSelector,
    5000,
    context
  )) as HTMLInputElement;
  if (!loginInput) {
    log('Не найдено поле ввода логина', 'crimson');
    return;
  }
  const input = (inputElement: HTMLInputElement, value: string): void => {
    if (options.inputType === 'nativeInput') {
      nativeInput(inputElement, value);
    } else if (options.inputType === 'react') {
      setReactInputValue(inputElement, value);
    } else {
      // eslint-disable-next-line no-param-reassign
      inputElement.value = value;
      fireEvent(inputElement, 'input');
    }
  };
  input(loginInput, worker.Login);
  const passwordInput = (await getElement(
    options.passwordInputSelector,
    5000,
    context
  )) as HTMLInputElement;
  if (!passwordInput) {
    log('Не найдено поле ввода пароля', 'crimson');
    return;
  }
  input(passwordInput, worker.Password);
  const loginSubmitButton = (await getElement(
    options.submitButtonSelector,
    5000,
    context
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
    getElement(options.captchaSelector, 5000, context).then((element) => {
      if (element) {
        log('Появилась капча', 'orange');
      }
    });
  }

  if (options.loginedWait) {
    const logined = await getElement(
      options.loginedWait.loginedSelector,
      5000,
      context
    );
    if (!logined) {
      log('Авторизация не удалась', 'crimson');
      return;
    }
    log('Авторизация успешна', 'green');
    worker.Islogin = true;
    worker.JSLogined();
    const balanceLoaded = await options.loginedWait.balanceReady();
    if (!balanceLoaded) {
      log(`Баланс не появился`, 'crimson');
    } else {
      options.loginedWait.updateBalance();
    }
    if (options.afterSuccesfulLogin) {
      options.afterSuccesfulLogin();
    }
  }
};

export default authorizeGenerator;

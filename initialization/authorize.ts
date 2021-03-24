import {
  getElement,
  log,
  sleep,
  fireEvent,
  nativeInput,
} from '@kot-shrodingera-team/germes-utils';
import { setReactInputValue } from '@kot-shrodingera-team/germes-utils/reactUtils';

/**
 * Генератор функции авторизации на сайте бк
 * @param options Опции:
 * - openForm - Открытие формы авторизации
 * -- selector - Селектор элемента открытия формы
 * -- openedSelector - Селектор элемента открытой формы
 * - - loopCount - Количество попыток открытия формы, по умолчанию 10
 * -- triesInterval - Интервал попыток открытия формы в мс, по умолчанию 1000
 * -- afterOpenDelay - Задержка после появления открытой формы, по умолчанию 0
 * - setLoginType - Функция выбота типа логина (например по телефону, e-mail и тд)
 * - loginInputSelector - Селектор элемента ввода логина
 * - passwordInputSelector - Селектор элемента ввода пароля
 * - submitButtonSelector - Селектор элемента submit (кнопка входа)
 * - inputType - Тип ввода данных в поля логина и пароля, по умолчанию fireEvent
 * - fireEventNames - Массив имён событий, вызываемых при использовании inputType = fireEvent, по умолчанию одно событие input
 * - beforeSubmitDelay - Задержка перед submit (после ввода данных), по умолчанию 0
 * - captchaSelector - Селектор капчи, если она появляется после попытки входа
 * - loginedWait - Ожидание появления авторизации (если страница не перезагружается)
 * -- loginedSelector - Селектор элемента наличия авторизации
 * -- balanceReady - Функция ожидания появления баланса
 * -- updateBalance - Функция обновления баланса в боте
 * -- afterSuccesfulLogin - Функция, выполняющася после успешной авторизации
 * - context - Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
 */
const authorizeGenerator = (options: {
  openForm?: {
    selector: string;
    openedSelector: string;
    loopCount?: number;
    triesInterval?: number;
    afterOpenDelay?: number;
  };
  setLoginType?: () => Promise<boolean>;
  loginInputSelector: string;
  passwordInputSelector: string;
  submitButtonSelector: string;
  inputType?: 'fireEvent' | 'react' | 'nativeInput';
  fireEventNames?: string[];
  beforeSubmitDelay?: number;
  captchaSelector?: string;
  loginedWait?: {
    loginedSelector: string;
    balanceReady: () => Promise<boolean>;
    updateBalance: () => void;
    afterSuccesfulLogin?: () => Promise<void>;
  };
  context?: () => Document | Element;
}) => async (): Promise<void> => {
  const context = options.context ? options.context() : document;
  if (options.openForm) {
    const loopCount = options.openForm.loopCount
      ? options.openForm.loopCount
      : 10;
    const triesInterval = options.openForm.triesInterval
      ? options.openForm.triesInterval
      : 1000;
    for (let i = 1; i <= loopCount; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const openLoginFormButton = await getElement<HTMLElement>(
        options.openForm.selector,
        1000,
        context
      );
      if (!openLoginFormButton) {
        log('Не найдена кнопка открытия формы авторизации', 'crimson');
        return;
      }
      openLoginFormButton.click();
      // eslint-disable-next-line no-await-in-loop
      const authForm = await getElement(
        options.openForm.openedSelector,
        triesInterval,
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
  const loginInput = await getElement<HTMLInputElement>(
    options.loginInputSelector,
    5000,
    context
  );
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
      if (options.fireEventNames) {
        options.fireEventNames.forEach((eventName) => {
          fireEvent(inputElement, eventName);
        });
      } else {
        fireEvent(inputElement, 'input');
      }
    }
  };
  input(loginInput, worker.Login);
  const passwordInput = await getElement<HTMLInputElement>(
    options.passwordInputSelector,
    5000,
    context
  );
  if (!passwordInput) {
    log('Не найдено поле ввода пароля', 'crimson');
    return;
  }
  input(passwordInput, worker.Password);
  const loginSubmitButton = await getElement<HTMLElement>(
    options.submitButtonSelector,
    5000,
    context
  );
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
    if (options.loginedWait.afterSuccesfulLogin) {
      options.loginedWait.afterSuccesfulLogin();
    }
  }
};

export default authorizeGenerator;

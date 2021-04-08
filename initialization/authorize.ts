import {
  getElement,
  log,
  sleep,
  fireEvent,
  nativeInput,
} from '@kot-shrodingera-team/germes-utils';
import { setReactInputValue } from '@kot-shrodingera-team/germes-utils/reactUtils';

/**
 * Опции генератора функции авторизации на сайте бк
 */
interface AuthorizeGeneratorOptions {
  /**
   * Опции открытия формы авторизации
   *
   * Используется если на сайте не отображаются сразу поля логина и пароля,
   * а есть отдельная кнопка для открытия формы авторизации
   */
  openForm?: {
    /**
     * Селектор элемента открытия формы
     */
    selector: string;
    /**
     * Селектор элемента открытой формы
     */
    openedSelector: string;
    /**
     * Количество попыток открытия формы, по умолчанию 10
     */
    loopCount?: number;
    /**
     * Интервал попыток открытия формы в мс, по умолчанию 1000
     */
    triesInterval?: number;
    /**
     * Задержка в мс после появления открытой формы, перед вводом данных, по умолчанию 0
     */
    afterOpenDelay?: number;
  };
  /**
   * Функция выбора типа логина
   *
   * Используется если есть разные типы логина (например по телефону или по почте)
   * и перед вводом данных нужно переключиться на этот тип
   */
  setLoginType?: () => Promise<boolean>;
  /**
   * Селектор элемента ввода логина
   */
  loginInputSelector: string;
  /**
   * Селектор элемента ввода пароля
   */
  passwordInputSelector: string;
  /**
   * Селектор элемента submit (кнопка входа)
   */
  submitButtonSelector: string;
  /**
   * Тип ввода данных в поля логина и пароля, по умолчанию fireEvent
   */
  inputType?: 'fireEvent' | 'react' | 'nativeInput';
  /**
   * Массив имён инициируемых событих, если тип ввода данных fireEvent, по умолчанию одно событие input
   *
   * Используется если нужно инициировать другие события, например keyDown, keyUp и тд.
   * Выполняются в указанном порядке
   */
  fireEventNames?: string[];
  /**
   * Задержка перед submit (после ввода данных), по умолчанию 0
   */
  beforeSubmitDelay?: number;
  /**
   * Селектор капчи, если она появляется после попытки входа
   *
   * Ожидания нет, но если капча появится, будет выведено сообщение в лог
   */
  captchaSelector?: string;
  /**
   * Ожидание появления авторизации
   *
   * Используется если авторизация происходит без перезагрузки страницы
   */
  loginedWait?: {
    /**
     * Селектор элемента наличия авторизации
     */
    loginedSelector: string;
    /**
     * Таймаут ожидания появления авторизации
     */
    timeout?: number;
    /**
     * Функция ожидания появления баланса
     */
    balanceReady: () => Promise<boolean>;
    /**
     * Функция обновления баланса в боте
     */
    updateBalance: () => void;
    /**
     * Функция, выполняющася после успешной авторизации
     */
    afterSuccesfulLogin?: () => Promise<void>;
  };
  /**
   * context - Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
   */
  context?: () => Document | Element;
}

/**
 * Генератор функции авторизации на сайте бк
 */
const authorizeGenerator = (
  options: AuthorizeGeneratorOptions
) => async (): Promise<void> => {
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
        // fireEvent(inputElement, 'focus');
        // fireEvent(inputElement, 'click');
        // fireEvent(inputElement, 'keypress');
        // fireEvent(inputElement, 'keyup');
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
    const timeout = options.loginedWait.timeout || 5000;
    const logined = await getElement(
      options.loginedWait.loginedSelector,
      timeout,
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

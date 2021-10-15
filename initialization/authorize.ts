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
     * Задержка в мс после перед открытием формы, по умолчанию 0
     */
    beforeOpenDelay?: number;
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
   * Функция проверки перед вводом данных
   *
   * Используется, если, например, нужно переключить типа логина (по почте, логину или телефону)
   * Или какие-то другие проверки
   *
   * Если вернёт false, авторизация считается не успешной
   */
  preInputCheck?: () => Promise<boolean>;
  /**
   * Селектор элемента ввода логина
   */
  loginInputSelector: string;
  /**
   * Селектор элемента ввода пароля
   */
  passwordInputSelector: string;
  /**
   * Задержка перед вводом пароля, по умолчанию 0
   */
  beforePasswordInputDelay?: number;
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
   * Функция проверки перед попыткой входа (нажатием кнопки)
   *
   * Если вернёт false, авторизация считается не успешной
   */
  beforeSubmitCheck?: () => Promise<boolean>;
  /**
   * Функция проверки после попыткой входа (нажатия кнопки)
   *
   * Если вернёт false, авторизация считается не успешной
   */
  afterSubmitCheck?: () => Promise<boolean>;
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

  /* ========================================================================== */
  /*                         Открытие формы авторизации                         */
  /* ========================================================================== */

  if (options.openForm) {
    const loopCount = options.openForm.loopCount
      ? options.openForm.loopCount
      : 10;
    const triesInterval = options.openForm.triesInterval
      ? options.openForm.triesInterval
      : 1000;

    /* --------------- Ожидание перед открытием формы авторизации --------------- */

    if (options.openForm.beforeOpenDelay) {
      log(
        `Ожидание (${options.openForm.beforeOpenDelay} мс) перед открытием формы авторизации`,
        'cadetblue',
        true
      );
      await sleep(options.openForm.beforeOpenDelay);
    }

    /* ----------------- Цикл попыток открытия формы авторизации ---------------- */

    for (let i = 1; i <= loopCount; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await Promise.race([
        getElement(options.openForm.selector, 5000, context),
        getElement(options.openForm.openedSelector, 5000, context),
      ]);

      const openLoginFormButton = context.querySelector<HTMLElement>(
        options.openForm.selector
      );
      const openedForm = context.querySelector<HTMLElement>(
        options.openForm.openedSelector
      );
      if (openedForm) {
        log('Форма авторизации уже открыта', 'cadetblue', true);
        break;
      }
      if (!openLoginFormButton) {
        log('Не найдена кнопка открытия формы авторизации', 'crimson');
        return;
      }

      log('Открываем форму авторизации', 'darksalmon', true);
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
        log('Появилась форма авторизации', 'cadetblue', true);
        break;
      }
    }

    /* ---------------- Задержка после открытия формы авторизации --------------- */

    if (options.openForm.afterOpenDelay) {
      log(
        `Ожидание (${options.openForm.afterOpenDelay} мс) после открытия формы авторизации`,
        'cadetblue',
        true
      );
      await sleep(options.openForm.afterOpenDelay);
    }
  }

  /* ========================================================================== */
  /*                        Проверка перед вводом данных                        */
  /* ========================================================================== */

  if (options.preInputCheck) {
    const preInputCheckSuccesful = await options.preInputCheck();
    if (!preInputCheckSuccesful) {
      log('Не пройдена проверка перед вводом данных авторизации', 'crimson');
      return;
    }
  }

  /* ========================================================================== */
  /*                          Определение метода ввода                          */
  /* ========================================================================== */

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

  /* ========================================================================== */
  /*                                 Ввод данных                                */
  /* ========================================================================== */

  log('Вводим данные для авторизации', 'darksalmon', true);

  /* ------------------------------- Ввод логина ------------------------------ */

  const loginInput = await getElement<HTMLInputElement>(
    options.loginInputSelector,
    5000,
    context
  );
  if (!loginInput) {
    log('Не найдено поле ввода логина', 'crimson');
    return;
  }
  input(loginInput, worker.Login);

  /* ---------------------- Задержка перед вводом пароля ---------------------- */

  if (options.beforePasswordInputDelay) {
    log(
      `Ожидание (${options.beforePasswordInputDelay} мс) перед вводом пароля`,
      'cadetblue',
      true
    );
    await sleep(options.beforePasswordInputDelay);
  }

  /* ------------------------------- Ввод пароля ------------------------------ */

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

  /* ========================================================================== */
  /*                    Ожидание перед нажатием кнопки входа                    */
  /* ========================================================================== */

  if (options.beforeSubmitDelay) {
    log(
      `Ожидание (${options.beforeSubmitDelay} мс) перед нажатием кнопки входа`,
      'cadetblue',
      true
    );
    await sleep(options.beforeSubmitDelay);
  }

  /* ========================================================================== */
  /*                    Проверка перед нажатием кнопки входа                    */
  /* ========================================================================== */

  if (options.beforeSubmitCheck) {
    const check = await options.beforeSubmitCheck();
    if (!check) {
      log('Не удалось пройти проверку перед попыткой входа', 'crimson');
      return;
    }
  }

  /* ========================================================================== */
  /*                            Нажатие кнопки входа                            */
  /* ========================================================================== */

  const loginSubmitButton = await getElement<HTMLElement>(
    options.submitButtonSelector,
    5000,
    context
  );
  if (!loginSubmitButton) {
    log('Не найдена кнопка входа', 'crimson');
    return;
  }

  log('Нажимаем на кнопку входа', 'darksalmon', true);
  loginSubmitButton.click();
  worker.LoginTry += 1;

  /* ========================================================================== */
  /*                     Проверка после нажатия кнопки входа                    */
  /* ========================================================================== */

  if (options.afterSubmitCheck) {
    const check = await options.afterSubmitCheck();
    if (!check) {
      log('Не удалось пройти проверку после попыткой входа', 'crimson');
      return;
    }
  }

  /* ========================================================================== */
  /*               Ожидание авторизации после нажатия кнопки входа              */
  /* ========================================================================== */

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

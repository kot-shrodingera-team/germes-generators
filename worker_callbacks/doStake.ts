import {
  getWorkerParameter,
  log,
  timeString,
} from '@kot-shrodingera-team/germes-utils';

/**
 * Опции генератора колбэка doStake (попытка ставки)
 */
interface DoStakeGeneratorOptions {
  /**
   * Функция проверки перед попыткой ставки
   *
   * Если вернёт false, попытка ставки считается не успешной
   */
  preCheck?: () => boolean;
  /**
   * Селектор элемента кнопки ставки
   */
  doStakeButtonSelector: string;
  /**
   * Проверяемые классы ошибок/недоступности кнопки ставки
   *
   * Если у элемента кнопки ставки будет хотя бы одни такой класс, попытка ставки считается не успешной
   */
  errorClasses?: {
    /**
     * Имя класса, которое указывает на ошибку/недоступность кнопки ставки
     */
    className: string;
    /**
     * Дополнительное пояснение для этой ошибки
     */
    message?: string;
  }[];
  /**
   * Флаг проверки кнопки ставки на аттрибут disabled, по умолчанию false
   */
  disabledCheck?: boolean;
  /**
   * Функции получения коэффициента
   */
  getCoefficient: () => number;
  /**
   * Функция проверки после попытки ставки
   *
   * Если вернёт false, попытка ставки считается не успешной
   */
  postCheck?: () => boolean;
  /**
   * Функция сброса момента начала попытки ставки
   */
  clearDoStakeTime: () => void;
  /**
   * context - Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
   */
  context?: () => Document | Element;
}

/**
 * Генератор колбэка doStake (попытка ставки)
 * @returns Функция, которая возвращает true, если попытка ставки успешна, иначе false
 */
const doStakeGenerator = (options: DoStakeGeneratorOptions) => (): boolean => {
  if (getWorkerParameter('fakeDoStake')) {
    log('[fake] Делаем ставку', 'orange');
    return true;
  }
  const context = options.context ? options.context() : document;
  log('Делаем ставку', 'orange');
  if (options.preCheck && !options.preCheck()) {
    return false;
  }
  const stakeButton = context.querySelector<HTMLButtonElement>(
    options.doStakeButtonSelector
  );

  if (!stakeButton) {
    log('Не найдена кнопка "Сделать ставку"', 'crimson');
    return false;
  }
  const actualCoefficient = options.getCoefficient();
  log(`Коэффициент перед ставкой: "${actualCoefficient}"`, 'steelblue');
  if (actualCoefficient < worker.StakeInfo.Coef) {
    log('Коэффициент перед ставкой упал', 'crimson');
    return false;
  }
  if (options.errorClasses) {
    const errorClass = options.errorClasses.find(({ className }) => {
      return [...stakeButton.classList].includes(className);
    });
    if (errorClass) {
      log(
        `Кнопка ставки недоступна${
          errorClass.message ? ` (${errorClass.message})` : ''
        }`,
        'crimson'
      );
      return false;
    }
  }
  if (options.disabledCheck) {
    if (stakeButton.disabled) {
      log('Кнопка ставки недоступна', 'crimson');
      return false;
    }
  }
  if (options.postCheck && !options.postCheck()) {
    return false;
  }
  options.clearDoStakeTime();
  log(`Время ставки: ${timeString(new Date())}`, 'steelblue');
  stakeButton.click();
  return true;
};

export default doStakeGenerator;

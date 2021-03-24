import { log, timeString } from '@kot-shrodingera-team/germes-utils';

/**
 * Генератор колбэка doStake (попытка ставки)
 * @param options Опции:
 * - preCheck - Функция проверки перед попыткой ставки, если вернёт false, попытка ставки считается не успешной
 * - doStakeButtonSelector - Селектор элемента кнопки ставки
 * -- errorClasses - Массив объектов в виде пар className (класс какой-то ошибки кнопки ставки) - message
 * - disabledCheck - Проверка кнопки ставки на аттрибут disabled, по умолчанию false
 * - getCoefficient - Функции получения коэффициента, для проверки
 * - postCheck - Функция проверки после попыткой ставки, если вернёт false, попытка ставки считается не успешной
 * - clearDoStakeTime - Функция сброса момента начала попытки ставки
 * - context - Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
 * @returns Функция, которая возвращает true, если попытка ставки успешна, иначе false
 */
const doStakeGenerator = (options: {
  preCheck?: () => boolean;
  doStakeButtonSelector: string;
  errorClasses?: {
    className: string;
    message?: string;
  }[];
  disabledCheck?: boolean;
  getCoefficient: () => number;
  postCheck?: () => boolean;
  clearDoStakeTime: () => void;
  context?: () => Document | Element;
}) => (): boolean => {
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

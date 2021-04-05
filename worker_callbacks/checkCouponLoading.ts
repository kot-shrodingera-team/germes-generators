import {
  stakeInfoString,
  log,
  timeString,
  getWorkerParameter,
} from '@kot-shrodingera-team/germes-utils';

/**
 * Опции генератора колбэка checkCouponLoading (проверка статуса обработки ставки)
 */
interface CheckCouponLoadingGeneratorOptions {
  /**
   * Функция получения момента начала попытки ставки
   *
   * Используется для определения таймаута попытки
   */
  getDoStakeTime: () => Date;
  /**
   * Название БК
   *
   * Используется в текста информа при таймауте
   */
  bookmakerName: string;
  /**
   * Таймаут проверки в мс, по истечению которого, обработка считается законченной, по умолчанию 60000
   */
  timeout?: number;
  /**
   * Функция проверки статуса обработки
   */
  check: () => boolean;
  /**
   * Имя параметра воркера, который включает фейковое проставление ставки
   */
  fakeDoStakeWorkerParameterName?: string;
}

/**
 * Генератор колбэка checkCouponLoading (проверка статуса обработки ставки)
 * @returns Функция, которая возвращает true, если ставка ещё обрабатывается, иначе false
 */
const checkCouponLoadingGenerator = (
  options: CheckCouponLoadingGeneratorOptions
) => (): boolean => {
  if (
    options.fakeDoStakeWorkerParameterName &&
    getWorkerParameter(options.fakeDoStakeWorkerParameterName)
  ) {
    log('[fake] Обработка ставки завершена', 'orange');
    return false;
  }
  const now = new Date();
  const doStakeTime = options.getDoStakeTime();
  const timePassedSinceDoStake = now.getTime() - doStakeTime.getTime();
  const timeout = Object.prototype.hasOwnProperty.call(options, 'timeout')
    ? options.timeout
    : 60000;
  if (timePassedSinceDoStake > timeout) {
    log(`now = ${now.getTime()}`, 'white', true);
    log(`doStakeTime = ${doStakeTime.getTime()}`, 'white', true);
    log(`timePassedSinceDoStake = ${timePassedSinceDoStake}`);
    log(`timeout = ${timeout}`);
    log(
      `Текущее время: ${timeString(now)}, время ставки: ${timeString(
        doStakeTime
      )}`
    );
    const message =
      `В ${options.bookmakerName} очень долгое принятие ставки\n` +
      `Бот засчитает ставку как НЕ принятую\n` +
      `${stakeInfoString()}\n` +
      `Пожалуйста, проверьте самостоятельно. Если всё плохо - пишите в ТП`;
    worker.Helper.SendInformedMessage(message);
    log('Слишком долгая обработка, считаем ставку непринятой', 'crimson');
    return false;
  }
  return options.check();
};

export default checkCouponLoadingGenerator;

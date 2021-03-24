import {
  stakeInfoString,
  log,
  timeString,
} from '@kot-shrodingera-team/germes-utils';

/**
 * Генератор колбэка checkCouponLoading (проверка статуса обработки ставки)
 * @param options Опции:
 * - getDoStakeTime - Функция получения момента начала попытки ставки
 * - bookmakerName - Название БК
 * - timeout - Таймаут проверки в мс, по истечению которого, обработка считается законченной, по умолчанию 60000
 * - check - Функция проверки статуса
 * @returns Функция, которая возвращает true, если ставка ещё обрабатывается, иначе false
 */
const checkCouponLoadingGenerator = (options: {
  getDoStakeTime: () => Date;
  bookmakerName: string;
  timeout?: number;
  check: () => boolean;
}) => (): boolean => {
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

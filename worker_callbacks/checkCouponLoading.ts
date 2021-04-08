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
   * Функция проверки статуса обработки
   */
  check: () => boolean;
}

/**
 * Генератор колбэка checkCouponLoading (проверка статуса обработки ставки)
 * @returns Функция, которая возвращает true, если ставка ещё обрабатывается, иначе false
 */
const checkCouponLoadingGenerator = (
  options: CheckCouponLoadingGeneratorOptions
) => (): boolean => {
  if (getWorkerParameter('fakeDoStake')) {
    log('[fake] Обработка ставки завершена', 'orange');
    return false;
  }
  const now = new Date();
  const { doStakeTime } = window.germesData;
  const timePassedSinceDoStake = now.getTime() - doStakeTime.getTime();
  const timeout = window.germesData.betProcessingTimeout
    ? window.germesData.betProcessingTimeout + 10000
    : 50000;
  if (timePassedSinceDoStake > timeout) {
    log(`now = ${now.getTime()}`, 'white', true);
    log(`doStakeTime = ${doStakeTime.getTime()}`, 'white', true);
    log(`timePassedSinceDoStake = ${timePassedSinceDoStake}`, 'white', true);
    log(`timeout = ${timeout}`, 'white', true);
    log(
      `Время ставки: ${timeString(doStakeTime)}\nТекущее время: ${timeString(
        now
      )}`
    );
    const message =
      `В ${window.germesData.bookmakerName} очень долгое принятие ставки\n` +
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

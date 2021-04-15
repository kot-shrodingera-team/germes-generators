import {
  stakeInfoString,
  log,
  getWorkerParameter,
} from '@kot-shrodingera-team/germes-utils';

/**
 * Опции генератора колбэка checkCouponLoading (проверка статуса обработки ставки)
 */
interface CheckCouponLoadingGeneratorOptions {
  /**
   * Асинхронная функция проверки статуса обработки
   */
  asyncCheck: () => Promise<void>;
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
    const message =
      `В ${window.germesData.bookmakerName} очень долгое принятие ставки\n` +
      `Бот засчитает ставку как НЕ принятую\n` +
      `${stakeInfoString()}\n` +
      `Пожалуйста, проверьте самостоятельно. Если всё плохо - пишите в ТП`;
    worker.Helper.SendInformedMessage(message);
    log(
      `Слишком долгая обработка (> ${
        timeout / 1000
      }), считаем ставку непринятой`,
      'crimson'
    );
    return false;
  }
  const step = window.germesData.betProcessingStep;
  const additionalInfo = window.germesData.betProcessingAdditionalInfo
    ? ` (${window.germesData.betProcessingAdditionalInfo})`
    : '';
  switch (step) {
    case 'beforeStart':
      options.asyncCheck();
      window.germesData.betProcessingStep = 'waitingForLoaderOrResult';
      return true;
    case 'error':
    case 'success':
    case 'reopened':
      log(`Обработка ставки завершена${additionalInfo}`, 'orange');
      // log(step, 'orange', true);
      return false;
    case 'reopen':
      log(`Переоткрытие купона${additionalInfo}`, 'tan');
      return true;
    default:
      log(`Обработка ставки${additionalInfo}`, 'tan');
      // log(step, 'tan', true);
      return true;
  }
};

export default checkCouponLoadingGenerator;

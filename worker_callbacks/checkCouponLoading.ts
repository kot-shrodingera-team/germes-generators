import {
  getWorkerParameter,
  log,
  stakeInfoString,
} from '@kot-shrodingera-team/germes-utils';

/**
 * Опции генератора колбэка checkCouponLoading (проверка статуса обработки ставки)
 */
interface CheckCouponLoadingGeneratorOptions {
  /**
   * Асинхронная функция проверки статуса обработки
   */
  asyncCheck: () => Promise<void>;
  /**
   * Флаг отключения вывода лога "Обработка ставки", по умолчанию false
   */
  disableLog?: boolean;
}

/**
 * Генератор колбэка checkCouponLoading (проверка статуса обработки ставки)
 * @returns Функция, которая возвращает true, если ставка ещё обрабатывается, иначе false
 */
const checkCouponLoadingGenerator =
  (options: CheckCouponLoadingGeneratorOptions) => (): boolean => {
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
        window.germesData.betProcessingStep = 'processing';
        return true;
      case 'processing':
        if (!options.disableLog) {
          log(`Обработка ставки${additionalInfo}`, 'tan');
        }
        return true;
      case 'error':
        log('Обработка ставки завершена (ошибка)', 'orange');
        return false;
      case 'success':
        log('Обработка ставки завершена (принята)', 'orange');
        return false;
      case 'reopened':
        log('Обработка ставки завершена (ставка переоткрыта)', 'orange');
        return false;
      case 'reopen':
        log('Переоткрытие купона', 'tan');
        return true;
      default:
        log(`Обработка ставки (!default)${additionalInfo}`, 'tan');
        return true;
    }
  };

export default checkCouponLoadingGenerator;

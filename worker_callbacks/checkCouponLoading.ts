import { stakeInfoString, log } from '@kot-shrodingera-team/germes-utils';

const checkCouponLoadingGenerator = (options: {
  getDoStakeTime: () => Date;
  bookmakerName: string;
  timeout?: number;
  check: () => boolean;
}) => (): boolean => {
  const timePassedSinceDoStake =
    new Date().getTime() - options.getDoStakeTime().getTime();
  if (
    timePassedSinceDoStake >
    Object.prototype.hasOwnProperty.call(options, 'timeout')
      ? options.timeout
      : 60000
  ) {
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

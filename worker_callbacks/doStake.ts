import { log } from '@kot-shrodingera-team/germes-utils';

const doStakeGenerator = (options: {
  preAction?: () => boolean;
  doStakeButtonSelector: string;
  getCoefficient: () => number;
  clearDoStakeTime: () => void;
}) => (): boolean => {
  log('Делаем ставку', 'orange');
  if (options.preAction && !options.preAction()) {
    return false;
  }
  const stakeButton = document.querySelector(
    options.doStakeButtonSelector
  ) as HTMLElement;

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
  options.clearDoStakeTime();
  stakeButton.click();
  return true;
};

export default doStakeGenerator;
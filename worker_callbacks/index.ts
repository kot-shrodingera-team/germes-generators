import {
  log,
  fireEvent,
  stakeInfoString,
} from '@kot-shrodingera-team/germes-utils';

export const getStakeInfoGenerator = (
  checkAuth: () => boolean,
  getStakeCount: () => number,
  getBalance: () => number,
  getMinimumStake: () => number,
  getMaximumStake: () => number,
  getCurrentSum: () => number,
  checkStakeEnabled: () => boolean,
  getCoefficient: () => number,
  getParameter: () => number
) => (): void => {
  worker.StakeInfo.Auth = checkAuth();
  worker.StakeInfo.StakeCount = getStakeCount();
  worker.StakeInfo.Balance = getBalance();
  worker.StakeInfo.MinSumm = getMinimumStake();
  worker.StakeInfo.MaxSumm = getMaximumStake();
  worker.StakeInfo.Summ = getCurrentSum();
  worker.StakeInfo.IsEnebled = checkStakeEnabled();
  worker.StakeInfo.Coef = getCoefficient();
  worker.StakeInfo.Parametr = getParameter();
  const message =
    `Информация о ставке:\n` +
    `Авторизация: ${worker.StakeInfo.Auth ? 'Есть' : 'Нет'}\n` +
    `Баланс: ${worker.StakeInfo.Balance}\n` +
    `Ставок в купоне: ${worker.StakeInfo.StakeCount}\n` +
    `Ставка доступна:  ${worker.StakeInfo.IsEnebled ? 'Да' : 'Нет'}\n` +
    `Лимиты: ${worker.StakeInfo.MinSumm} - ${worker.StakeInfo.MaxSumm}\n` +
    `Текущая сумма в купоне: ${worker.StakeInfo.Summ}\n` +
    `Коэффициент: ${worker.StakeInfo.Coef}\n` +
    `Параметр: ${worker.StakeInfo.Parametr}`;
  log(message, 'lightgrey');
};

export const setStakeSumGenerator = (options: { sumInputSelector: string }) => (
  sum: number
): boolean => {
  log(`Вводим сумму ставки: "${sum}"`, 'orange');
  const inputElement = document.querySelector(
    options.sumInputSelector
  ) as HTMLInputElement;
  if (!inputElement) {
    log('Поле ввода ставки не найдено', 'crimson');
    return false;
  }
  inputElement.value = String(sum);
  fireEvent(inputElement, 'input');
  worker.StakeInfo.Summ = sum;
  return true;
};

export const doStakeGenerator = (options: {
  doStakeButtonSelector: string;
  getCoefficient: () => number;
  clearDoStakeTime: () => void;
}) => (): boolean => {
  log('Делаем ставку', 'orange');
  const stakeButton = document.querySelector(
    options.doStakeButtonSelector
  ) as HTMLElement;

  if (!stakeButton) {
    log('Не найдена кнопка "Сделать ставку"', 'crimson');
    return false;
  }
  const actualCoefficient = options.getCoefficient();
  worker.Helper.WriteLine(`Коэффициент перед ставкой: ${actualCoefficient}`);
  if (actualCoefficient < worker.StakeInfo.Coef) {
    worker.Helper.WriteLine('Коэффициент перед ставкой упал');
    return false;
  }
  options.clearDoStakeTime();
  stakeButton.click();
  return true;
};

export const checkCouponLoadingGenerator = (options: {
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

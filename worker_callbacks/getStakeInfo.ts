import { log } from '@kot-shrodingera-team/germes-utils';

const getStakeInfoGenerator = (options: {
  preAction?: () => void;
  checkAuth: () => boolean;
  getStakeCount: () => number;
  getBalance: () => number;
  getMinimumStake: () => number;
  getMaximumStake: () => number;
  getCurrentSum: () => number;
  checkStakeEnabled: () => boolean;
  getCoefficient: () => number;
  getParameter: () => number;
}) => (): void => {
  if (options.preAction) {
    options.preAction();
  }
  worker.StakeInfo.Auth = options.checkAuth();
  worker.StakeInfo.StakeCount = options.getStakeCount();
  worker.StakeInfo.Balance = options.getBalance();
  worker.StakeInfo.MinSumm = options.getMinimumStake();
  worker.StakeInfo.MaxSumm = options.getMaximumStake();
  worker.StakeInfo.Summ = options.getCurrentSum();
  worker.StakeInfo.IsEnebled = options.checkStakeEnabled();
  worker.StakeInfo.Coef = options.getCoefficient();
  worker.StakeInfo.Parametr = options.getParameter();
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

export default getStakeInfoGenerator;

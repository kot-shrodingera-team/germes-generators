import { log } from '@kot-shrodingera-team/germes-utils';

const getStakeInfoGenerator = (
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

export default getStakeInfoGenerator;

import { log } from '@kot-shrodingera-team/germes-utils';

/**
 * Генератор колбэка getStakeInfo (сбор информации о ставке)
 * @param options Опции:
 * - preAction - Функция, выполняющаяся перед сбором информации
 * - checkAuth - Функция определения авторизации
 * - getStakeCount - Функция получения количества ставок в купоне
 * - getBalance - Функция получения баланса
 * - getMinimumStake - Функция получения минимальной ставки
 * - getMaximumStake - Функция получения максимальной ставки
 * - getCurrentSum - Функция получения текущей суммы в купоне
 * - checkStakeEnabled - Функция проверки доступности ставки
 * - getCoefficient - Функция получения коэффициента
 * - getParameter - Функция получения параметра ставки
 */
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

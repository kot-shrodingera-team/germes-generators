import { log } from '@kot-shrodingera-team/germes-utils';

/**
 * Опции генератора колбэка getStakeInfo (сбор информации о ставке)
 */
interface GetStakeInfoGeneratorOptions {
  /**
   * Функция, выполняющаяся перед сбором информации
   */
  preAction?: () => void;
  /**
   * Функция определения авторизации
   */
  checkAuth: () => boolean;
  /**
   * Функция получения количества ставок в купоне
   */
  getStakeCount: () => number;
  /**
   * Функция получения баланса
   */
  getBalance: () => number;
  /**
   * Функция получения минимальной ставки
   */
  getMinimumStake: () => number;
  /**
   * Функция получения максимальной ставки
   */
  getMaximumStake: () => number;
  /**
   * Функция получения текущей суммы в купоне
   */
  getCurrentSum: () => number;
  /**
   * Функция проверки доступности ставки
   */
  checkStakeEnabled: () => boolean;
  /**
   * Функция получения коэффициента
   */
  getCoefficient: () => number;
  /**
   * Функция получения параметра ставки
   */
  getParameter: () => number;
}

/**
 * Генератор колбэка getStakeInfo (сбор информации о ставке)
 */
const getStakeInfoGenerator = (
  options: GetStakeInfoGeneratorOptions
) => (): void => {
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

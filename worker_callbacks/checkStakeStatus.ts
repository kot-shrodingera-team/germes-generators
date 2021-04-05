import { getWorkerParameter, log } from '@kot-shrodingera-team/germes-utils';

/**
 * Опции генератора колбэка checkStakeStatus (определение результата ставки)
 */
interface CheckStakeStatusGeneratorOptions {
  /**
   * Функция получения текущего состояния обработки ставки
   */
  getProcessingStep: () => string;
  /**
   * Функция обновления баланса в бк
   */
  updateBalance: () => void;
  /**
   * Имя параметра воркера, который включает фейковое проставление ставки
   */
  fakeDoStakeWorkerParameterName?: string;
}

/**
 * Генератор колбэка checkStakeStatus (определение результата ставки)
 * @returns Функция, которая возвращает true, если ставка принята, иначе false
 */
const checkStakeStatusGenerator = (
  options: CheckStakeStatusGeneratorOptions
) => (): boolean => {
  if (
    options.fakeDoStakeWorkerParameterName &&
    getWorkerParameter(options.fakeDoStakeWorkerParameterName)
  ) {
    log('[fake] Ставка принята', 'green');
    return false;
  }
  if (options.getProcessingStep() === 'success') {
    log('Ставка принята', 'green');
    options.updateBalance();
    return true;
  }
  log('Ставка не принята', 'red');
  return false;
};

export default checkStakeStatusGenerator;

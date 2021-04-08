import { getWorkerParameter, log } from '@kot-shrodingera-team/germes-utils';

/**
 * Опции генератора колбэка checkStakeStatus (определение результата ставки)
 */
interface CheckStakeStatusGeneratorOptions {
  /**
   * Функция обновления баланса в бк
   */
  updateBalance: () => void;
}

/**
 * Генератор колбэка checkStakeStatus (определение результата ставки)
 * @returns Функция, которая возвращает true, если ставка принята, иначе false
 */
const checkStakeStatusGenerator = (
  options: CheckStakeStatusGeneratorOptions
) => (): boolean => {
  if (getWorkerParameter('fakeDoStake')) {
    log('[fake] Ставка принята', 'green');
    return true;
  }
  if (window.germesData.betProcessingStep === 'success') {
    log('Ставка принята', 'green');
    options.updateBalance();
    return true;
  }
  log('Ставка не принята', 'red');
  return false;
};

export default checkStakeStatusGenerator;

import { getWorkerParameter, log } from '@kot-shrodingera-team/germes-utils';
import {
  JsFailError,
  NewUrlError,
} from '@kot-shrodingera-team/germes-utils/errors';

interface ShowStakeGeneratorOptions {
  /**
   * Функция очистки window.germesData
   */
  clearGermesData: () => void;
  /**
   * Функция, выполняемая перед открытием события
   */
  preOpenEvent: () => Promise<void>;
  /**
   * Функция открытия события
   */
  openEvent: () => Promise<void>;
  /**
   * Функция, выполняемая перед открытием ставки
   */
  preOpenBet: () => Promise<void>;
  /**
   * Функция открытия ставки
   */
  openBet: () => Promise<void>;
  /**
   * Функция установки режима принятия ставки
   */
  setBetAcceptMode: () => Promise<void>;
  /**
   * Функция получения максимальной ставки
   */
  getMaximumStake: (disableLog: boolean) => number;
  /**
   * Функция получения коэффициента
   */
  getCoefficient: (disableLog: boolean) => number;
  /**
   * Функция получения параметра ставки
   */
  getParameter: (disableLog: boolean) => number;
  /**
   * Функция получения доступности ставки
   */
  getStakeEnabled: (disableLog: boolean) => boolean;
}

const showStakeGenerator = (
  options: ShowStakeGeneratorOptions
) => async (): Promise<void> => {
  if (getWorkerParameter('fakeOpenStake')) {
    log('[fake] Ставка открыта', 'green');
    worker.JSStop();
    return;
  }
  worker.SetSessionData(`${window.germesData.bookmakerName}.ShowStake`, '1');
  options.clearGermesData();
  try {
    log(
      `Открываем ставку:\n${worker.TeamOne} vs ${worker.TeamTwo}\n${worker.BetName}`,
      'steelblue'
    );
    await options.preOpenEvent();
    await options.openEvent();
    await options.preOpenBet();
    await options.openBet();
    await options.setBetAcceptMode();
    log('Ставка успешно открыта', 'green');
    worker.SetSessionData(`${window.germesData.bookmakerName}.ShowStake`, '0');
    if (
      worker.JSMaxChange ||
      worker.JSCoefChange ||
      worker.JSParameterChange ||
      worker.JSEnabledChange
    ) {
      window.germesData.updateManualDataIntervalId = setInterval(() => {
        if (window.germesData.stopUpdateManualData) {
          return;
        }
        if (worker.JSMaxChange) {
          const newMax = options.getMaximumStake(true);
          if (newMax && newMax !== window.germesData.manualMaximumStake) {
            log(
              `Обновляем макс ${window.germesData.manualMaximumStake} => ${newMax}`,
              'orange'
            );
            window.germesData.manualMaximumStake = newMax;
            worker.StakeInfo.MaxSumm = newMax;
            worker.JSMaxChange(newMax);
          }
        }
        if (worker.JSCoefChange) {
          const newCoef = options.getCoefficient(true);
          if (newCoef && newCoef !== window.germesData.manualCoefficient) {
            log(
              `Обновляем кэф ${window.germesData.manualCoefficient} => ${newCoef}`,
              'orange'
            );
            window.germesData.manualCoefficient = newCoef;
            worker.StakeInfo.Coef = newCoef;
            worker.JSCoefChange(newCoef);
          }
        }
        if (worker.JSParameterChange) {
          const newParameter = options.getParameter(true);
          if (
            newParameter &&
            newParameter !== window.germesData.manualParameter
          ) {
            log(
              `Обновляем кэф ${window.germesData.manualParameter} => ${newParameter}`,
              'orange'
            );
            window.germesData.manualParameter = newParameter;
            worker.StakeInfo.Parametr = newParameter;
            worker.JSParameterChange(newParameter);
          }
        }
        if (worker.JSEnabledChange) {
          const newStakeEnabled = options.getStakeEnabled(true);
          if (
            newStakeEnabled &&
            newStakeEnabled !== window.germesData.manualStakeEnabled
          ) {
            log(
              `Обновляем кэф ${window.germesData.manualStakeEnabled} => ${newStakeEnabled}`,
              'orange'
            );
            window.germesData.manualStakeEnabled = newStakeEnabled;
            worker.StakeInfo.IsEnebled = newStakeEnabled;
            worker.JSEnabledChange(newStakeEnabled);
          }
        }
      }, 200);
    }
    worker.JSStop();
  } catch (error) {
    if (error instanceof JsFailError) {
      log(error.message, 'red');
      worker.SetSessionData(
        `${window.germesData.bookmakerName}.ShowStake`,
        '0'
      );
      worker.JSFail();
    } else if (error instanceof NewUrlError) {
      log(error.message, 'orange');
    } else {
      // Любая другая ошибка
      log(
        'Скрипт вызвал исключение. Если часто повторяется, обратитесь в ТП',
        'red'
      );
      log(error.message, 'red');
      worker.SetSessionData(
        `${window.germesData.bookmakerName}.ShowStake`,
        '0'
      );
      worker.JSFail();
      throw error;
    }
  }
};

export default showStakeGenerator;

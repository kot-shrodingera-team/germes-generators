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

import {
  log,
  fireEvent,
  nativeInput,
  getWorkerParameter,
} from '@kot-shrodingera-team/germes-utils';
import { setReactInputValue } from '@kot-shrodingera-team/germes-utils/reactUtils';

/**
 * Опции генератора колбэка setStakeSum (ввод суммы ставки)
 */
interface SetStakeSumGeneratorOptions {
  /**
   * Селектор элемента ввода суммы в купоне
   */
  sumInputSelector: string;
  /**
   * Проверка, введена ли уже нужная сумма
   *
   * Если она уже введена, ввод суммы заканчивается и считается успешным
   */
  alreadySetCheck?: {
    /**
     * Функция получения текущей суммы в купоне
     */
    getCurrentSum: () => number;
    /**
     * Флаг, указывающий на то, считать ли ввод суммы не успешным после ввода, если изначально сумма была иной, по умолчанию false
     *
     * Используется, если нужна задержка после изменения суммы в купоне
     */
    falseOnSumChange: boolean;
  };
  /**
   * Функция проверки перед вводом суммы ставки
   *
   * Если вернёт false, ввод суммы ставки считается не успешной
   */
  preInputCheck?: (number?: number) => boolean;
  /**
   * Тип ввода данных в поле ввода суммы ставки, по умолчанию fireEvent
   */
  inputType?: 'fireEvent' | 'react' | 'nativeInput';
  /**
   * Массив имён инициируемых событих, если тип ввода данных fireEvent, по умолчанию одно событие input
   *
   * Используется если нужно инициировать другие события, например keyDown, keyUp и тд.
   * Выполняются в указанном порядке
   */
  fireEventNames?: string[];
  /**
   * context - Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
   */
  context?: () => Document | Element;
}

/**
 * Генератор колбэка setStakeSum (ввод суммы ставки)
 * @returns Функция, которая возвращает true, если ввод суммы ставки успешен, иначе false
 * - sum - вводимая сумма ставки
 */
const setStakeSumGenerator = (options: SetStakeSumGeneratorOptions) => (
  sum: number,
  disableLog = false,
  skipChecks = false
): boolean => {
  if (getWorkerParameter('fakeDoStake')) {
    log(`[fake] Вводим сумму ставки: "${sum}"`, 'orange');
    return true;
  }
  if (window.germesData.stakeDisabled) {
    log('Ставка недоступна [forced]. Не вводим сумму', 'crimson');
    return false;
  }
  const context = options.context ? options.context() : document;
  if (!disableLog) {
    log(`Вводим сумму ставки: "${sum}"`, 'orange');
  }
  if (!skipChecks && sum > worker.StakeInfo.Balance) {
    log('Ошибка ввода суммы ставки: вводимая сумма больше баланса', 'crimson');
    return false;
  }
  if (!skipChecks && sum > worker.StakeInfo.MaxSumm) {
    log(
      'Ошибка ввода суммы ставки: вводимая сумма больше максимальной ставки',
      'crimson'
    );
    return false;
  }
  const inputElement = context.querySelector<HTMLInputElement>(
    options.sumInputSelector
  );
  if (!inputElement) {
    log('Поле ввода суммы ставки не найдено', 'crimson');
    return false;
  }
  let falseOnSumChangeCheck = false;
  if (!skipChecks && options.alreadySetCheck) {
    const currentSum = options.alreadySetCheck.getCurrentSum();
    if (currentSum === sum) {
      if (!disableLog) {
        log('Уже введена нужная сумма', 'steelblue');
      }
      return true;
    }
    if (options.alreadySetCheck.falseOnSumChange) {
      falseOnSumChangeCheck = true;
    }
  }
  if (!skipChecks && options.preInputCheck && !options.preInputCheck(sum)) {
    return false;
  }
  if (options.inputType === 'nativeInput') {
    nativeInput(inputElement, String(sum));
  } else if (options.inputType === 'react') {
    setReactInputValue(inputElement, sum);
  } else {
    inputElement.value = String(sum);
    if (options.fireEventNames) {
      options.fireEventNames.forEach((eventName) => {
        fireEvent(inputElement, eventName);
      });
    } else {
      fireEvent(inputElement, 'input');
    }
  }
  if (falseOnSumChangeCheck) {
    if (!disableLog) {
      log('Задержка после изменения суммы в купоне', 'orange');
    }
    return false;
  }
  worker.StakeInfo.Summ = sum;
  return true;
};

/**
 * Генератор функции clearStakeSum (очистка поля ввода суммы ставки)
 * @returns Функция, которая возвращает true, если очистка поля ввода суммы ставки успешна, иначе false
 */
export const clearStakeSumGenerator = (
  options: SetStakeSumGeneratorOptions
) => (disableLog = false): boolean => {
  const context = options.context ? options.context() : document;
  if (!disableLog) {
    log('Очищаем сумму ставки', 'orange');
  }
  const inputElement = context.querySelector<HTMLInputElement>(
    options.sumInputSelector
  );
  if (!inputElement) {
    log('Поле ввода суммы ставки не найдено', 'crimson');
    return false;
  }
  if (options.inputType === 'nativeInput') {
    nativeInput(inputElement, '');
  } else if (options.inputType === 'react') {
    setReactInputValue(inputElement, '');
  } else {
    inputElement.value = '';
    if (options.fireEventNames) {
      options.fireEventNames.forEach((eventName) => {
        fireEvent(inputElement, eventName);
      });
    } else {
      fireEvent(inputElement, 'input');
    }
  }
  worker.StakeInfo.Summ = 0;
  return true;
};

export default setStakeSumGenerator;

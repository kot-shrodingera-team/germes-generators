import {
  log,
  fireEvent,
  nativeInput,
} from '@kot-shrodingera-team/germes-utils';
import { setReactInputValue } from '@kot-shrodingera-team/germes-utils/reactUtils';

const setStakeSumGenerator = (options: {
  sumInputSelector: string;
  alreadySetCheck?: {
    falseOnSumChange: boolean;
  };
  inputType?: 'fireEvent' | 'react' | 'nativeInput';
  fireEventName?: string;
  preInputCheck?: (number?: number) => boolean;
  context?: () => Document | Element;
}) => (sum: number): boolean => {
  const context = options.context ? options.context() : document;
  log(`Вводим сумму ставки: "${sum}"`, 'orange');
  if (sum > worker.StakeInfo.Balance) {
    log('Ошибка ввода суммы ставки: вводимая сумма больше баланса', 'crimson');
    return false;
  }
  if (sum > worker.StakeInfo.MaxSumm) {
    log(
      'Ошибка ввода суммы ставки: вводимая сумма больше максимальной ставки',
      'crimson'
    );
    return false;
  }
  const inputElement = context.querySelector(
    options.sumInputSelector
  ) as HTMLInputElement;
  if (!inputElement) {
    log('Поле ввода ставки не найдено', 'crimson');
    return false;
  }
  let falseOnSumChangeCheck = false;
  if (options.alreadySetCheck) {
    const currentSumMatch = inputElement.value.match(/(\d+(?:\.\d+)?)/);
    if (currentSumMatch && Number(currentSumMatch[0]) === sum) {
      log('Уже введена нужная сумма', 'steelblue');
      return true;
    }
    if (options.alreadySetCheck.falseOnSumChange) {
      falseOnSumChangeCheck = true;
    }
  }
  if (options.preInputCheck && !options.preInputCheck(sum)) {
    return false;
  }
  if (options.inputType === 'nativeInput') {
    nativeInput(inputElement, String(sum));
  } else if (options.inputType === 'react') {
    setReactInputValue(inputElement, sum);
  } else {
    inputElement.value = String(sum);
    fireEvent(
      inputElement,
      options.fireEventName ? options.fireEventName : 'input'
    );
  }
  if (falseOnSumChangeCheck) {
    log('Задержка после изменения суммы в купоне', 'orange');
    return false;
  }
  worker.StakeInfo.Summ = sum;
  return true;
};

export default setStakeSumGenerator;

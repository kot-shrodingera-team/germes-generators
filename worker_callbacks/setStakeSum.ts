import {
  log,
  fireEvent,
  nativeInput,
} from '@kot-shrodingera-team/germes-utils';
import { setReactInputValue } from '@kot-shrodingera-team/germes-utils/reactUtils';

const setStakeSumGenerator = (options: {
  sumInputSelector: string;
  inputType?: 'fireEvent' | 'react' | 'nativeInput';
}) => (sum: number): boolean => {
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
  const inputElement = document.querySelector(
    options.sumInputSelector
  ) as HTMLInputElement;
  if (!inputElement) {
    log('Поле ввода ставки не найдено', 'crimson');
    return false;
  }
  if (options.inputType === 'nativeInput') {
    nativeInput(inputElement, String(sum));
  } else if (options.inputType === 'react') {
    setReactInputValue(inputElement, sum);
  } else {
    inputElement.value = String(sum);
    fireEvent(inputElement, 'input');
  }
  worker.StakeInfo.Summ = sum;
  return true;
};

export default setStakeSumGenerator;

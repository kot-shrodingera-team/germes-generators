import { log, fireEvent } from '@kot-shrodingera-team/germes-utils';

const setStakeSumGenerator = (options: { sumInputSelector: string }) => (
  sum: number
): boolean => {
  log(`Вводим сумму ставки: "${sum}"`, 'orange');
  const inputElement = document.querySelector(
    options.sumInputSelector
  ) as HTMLInputElement;
  if (!inputElement) {
    log('Поле ввода ставки не найдено', 'crimson');
    return false;
  }
  inputElement.value = String(sum);
  fireEvent(inputElement, 'input');
  worker.StakeInfo.Summ = sum;
  return true;
};

export default setStakeSumGenerator;

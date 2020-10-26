import { log } from '@kot-shrodingera-team/germes-utils';

const defaultCurrentSumRegex = /(\d+(?:\.\d+)?)/;
const removeRegex = /[\s,']/g;

const getCurrentSumGenerator = (options: {
  sumInput: string;
  zeroValues?: string[];
  currentSumRegex?: RegExp;
  context?: () => Document | Element;
}) => (): number => {
  const context = options.context ? options.context() : document;
  const sumInput = context.querySelector(options.sumInput) as HTMLInputElement;
  if (!sumInput) {
    log('Не найдено поле ввода суммы ставки', 'crimson');
    return 0;
  }
  const sumText = sumInput.value.trim().replace(removeRegex, '');
  if (sumText === '') {
    return 0;
  }
  if (options.zeroValues && options.zeroValues.includes(sumText)) {
    return 0;
  }
  const currentSumRegex = options.currentSumRegex
    ? options.currentSumRegex
    : defaultCurrentSumRegex;
  const sumMatch = sumText.match(currentSumRegex);
  if (!sumMatch) {
    log(`Непонятный формат текущей суммы ставки: "${sumText}"`, 'crimson');
    return 0;
  }
  return Number(sumMatch[1]);
};

export default getCurrentSumGenerator;

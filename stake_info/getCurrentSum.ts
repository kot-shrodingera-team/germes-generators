import { log } from '@kot-shrodingera-team/germes-utils';
import { defaultNumberRegex, defaultRemoveRegex } from './defaultRegexes';

const getCurrentSumGenerator = (options: {
  sumInput: string;
  zeroValues?: string[];
  replaceDataArray?: {
    searchValue: string | RegExp;
    replaceValue: string;
  }[];
  removeRegex?: RegExp;
  currentSumRegex?: RegExp;
  context?: () => Document | Element;
}) => (): number => {
  const context = options.context ? options.context() : document;
  const sumInput = context.querySelector<HTMLInputElement>(options.sumInput);
  if (!sumInput) {
    log('Не найдено поле ввода суммы ставки', 'crimson');
    return 0;
  }
  let sumText = sumInputElement.value.trim();
  if (sumText === '') {
    return 0;
  }
  if (options.zeroValues && options.zeroValues.includes(sumText)) {
    return 0;
  }
  if (options.replaceDataArray) {
    options.replaceDataArray.forEach((replaceData) => {
      sumText = sumText.replace(
        replaceData.searchValue,
        replaceData.replaceValue
      );
    });
  }
  const removeRegex = options.removeRegex
    ? options.removeRegex
    : defaultRemoveRegex;
  sumText = sumText.replace(removeRegex, '');
  const currentSumRegex = options.currentSumRegex
    ? options.currentSumRegex
    : defaultNumberRegex;
  const sumMatch = sumText.match(currentSumRegex);
  if (!sumMatch) {
    log(`Непонятный формат текущей суммы ставки: "${sumText}"`, 'crimson');
    return 0;
  }
  return Number(sumMatch[1]);
};

export default getCurrentSumGenerator;

import { log } from '@kot-shrodingera-team/germes-utils';

const defaultMinRegex = /(\d+(?:\.\d+)?)/;
const removeRegex = /[\s,']/g;

const getMinimumStakeGenerator = (options: {
  minimumStakeElementSelector: string;
  minRegex?: RegExp;
}) => (): number => {
  const minimumStakeElement = document.querySelector(
    options.minimumStakeElementSelector
  );
  if (!minimumStakeElement) {
    log('Не найдена минимальная сумма ставки', 'crimson');
    return 0;
  }
  const minimumStakeText = minimumStakeElement.textContent
    .trim()
    .replace(removeRegex, '');
  const minRegex = options.minRegex ? options.minRegex : defaultMinRegex;
  const minMatch = minimumStakeText.match(minRegex);
  if (!minMatch) {
    log(
      `Непонятный формат маинимальной ставки: "${minimumStakeText}"`,
      'crimson'
    );
    return 0;
  }
  return Number(minMatch[1]);
};

export default getMinimumStakeGenerator;

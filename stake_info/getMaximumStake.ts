import { log } from '@kot-shrodingera-team/germes-utils';

const defaultMaxRegex = /(\d+(?:\.\d+)?)/;
const removeRegex = /[\s,']/g;

const getMaximumStakeGenerator = (options: {
  maximumStakeElementSelector: string;
  maxRegex?: RegExp;
}) => (): number => {
  const maximumStakeElement = document.querySelector(
    options.maximumStakeElementSelector
  );
  if (!maximumStakeElement) {
    log('Не найдена максимальная сумма ставки', 'crimson');
    return 0;
  }
  const maximumStakeText = maximumStakeElement.textContent
    .trim()
    .replace(removeRegex, '');
  const maxRegex = options.maxRegex ? options.maxRegex : defaultMaxRegex;
  const maxMatch = maximumStakeText.match(maxRegex);
  if (!maxMatch) {
    log(
      `Непонятный формат максимальной ставки: "${maximumStakeText}"`,
      'crimson'
    );
    return 0;
  }
  return Number(maxMatch[1]);
};

export default getMaximumStakeGenerator;

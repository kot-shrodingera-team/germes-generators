import { log, awaiter } from '@kot-shrodingera-team/germes-utils';

const defaultMaximumStakeRegex = /(\d+(?:\.\d+)?)/;
const removeRegex = /[\s,']/g;

export const maximumStakeReadyGenerator = (options: {
  maximumStakeElementSelector: string;
  maximumStakeRegex?: RegExp;
}) => async (timeout = 5000, interval = 100): Promise<boolean> => {
  const maximumStakeLoaded = Boolean(
    await awaiter(
      () => {
        const maximumStakeElement = document.querySelector(
          options.maximumStakeElementSelector
        );
        if (!maximumStakeElement) {
          return false;
        }
        const maximumStakeText = maximumStakeElement.textContent
          .trim()
          .replace(removeRegex, '');
        const maximumStakeRegex = options.maximumStakeRegex
          ? options.maximumStakeRegex
          : defaultMaximumStakeRegex;
        const maximumStakeMatch = maximumStakeText.match(maximumStakeRegex);
        return Boolean(maximumStakeMatch);
      },
      timeout,
      interval
    )
  );
  return maximumStakeLoaded;
};

const getMaximumStakeGenerator = (options: {
  maximumStakeElementSelector: string;
  maximumStakeRegex?: RegExp;
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
  const maximumStakeRegex = options.maximumStakeRegex
    ? options.maximumStakeRegex
    : defaultMaximumStakeRegex;
  const maximumStakeMatch = maximumStakeText.match(maximumStakeRegex);
  if (!maximumStakeMatch) {
    log(
      `Непонятный формат максимальной ставки: "${maximumStakeText}"`,
      'crimson'
    );
    return 0;
  }
  return Number(maximumStakeMatch[1]);
};

export default getMaximumStakeGenerator;

import { awaiter, log } from '@kot-shrodingera-team/germes-utils';

const defaultBalanceRegex = /(\d+(?:\.\d+)?)/;
const removeRegex = /[\s,']/g;

export const balanceReadyGenerator = (options: {
  balanceSelector: string;
  balanceRegex?: RegExp;
}) => async (timeout = 5000, interval = 100): Promise<boolean> => {
  const balanceLoaded = Boolean(
    await awaiter(
      () => {
        const balanceElement = document.querySelector(options.balanceSelector);
        if (!balanceElement) {
          return false;
        }
        const balanceText = balanceElement.textContent
          .trim()
          .replace(removeRegex, '');
        const balanceRegex = options.balanceRegex
          ? options.balanceRegex
          : defaultBalanceRegex;
        const balanceMatch = balanceText.match(balanceRegex);
        return Boolean(balanceMatch);
      },
      timeout,
      interval
    )
  );
  return balanceLoaded;
};

export const getBalanceGenerator = (options: {
  balanceSelector: string;
  balanceRegex?: RegExp;
}) => (): number => {
  const balanceElement = document.querySelector(
    options.balanceSelector
  ) as HTMLElement;
  if (!balanceElement) {
    log('Баланс не найден', 'crimson');
    return 0;
  }
  const balanceText = balanceElement.textContent
    .trim()
    .replace(removeRegex, '');
  const balanceRegex = options.balanceRegex
    ? options.balanceRegex
    : defaultBalanceRegex;
  const balanceMatch = balanceText.match(balanceRegex);
  if (!balanceMatch) {
    log(`Непонятный формат баланса: "${balanceText}"`, 'crimson');
    return 0;
  }
  return Number(balanceMatch[1]);
};
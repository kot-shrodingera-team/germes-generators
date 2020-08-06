import { awaiter, log } from '@kot-shrodingera-team/germes-utils';

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
        const balanceText = balanceElement.textContent.trim();
        if (options.balanceRegex) {
          const balanceMatch = balanceText.match(options.balanceRegex);
          return Boolean(balanceMatch);
        }
        const balance = Number(balanceText);
        return !Number.isNaN(balance);
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
  const balanceText = balanceElement.textContent.trim();
  if (options.balanceRegex) {
    const balanceMatch = balanceText.match(options.balanceRegex);
    if (!balanceMatch) {
      log(`Непонятный формат баланса: "${balanceText}"`, 'crimson');
      return 0;
    }
    return Number(balanceMatch[1]);
  }
  const balance = Number(balanceText);
  if (Number.isNaN(balance)) {
    log(`Непонятный формат баланса: "${balanceText}"`, 'crimson');
    return 0;
  }
  return balance;
};

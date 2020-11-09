import { awaiter, log } from '@kot-shrodingera-team/germes-utils';

const defaultBalanceRegex = /(\d+(?:\.\d+)?)/;
const defaultRemoveRegex = /[\s,']/g;

export const balanceReadyGenerator = (options: {
  balanceSelector: string;
  balanceRegex?: RegExp;
  replaceDataArray?: {
    searchValue: string | RegExp;
    replaceValue: string;
  }[];
  removeRegex?: RegExp;
  context?: () => Document | Element;
}) => async (timeout = 5000, interval = 100): Promise<boolean> => {
  const context = options.context ? options.context() : document;
  const balanceLoaded = Boolean(
    await awaiter(
      () => {
        const balanceElement = context.querySelector(options.balanceSelector);
        if (!balanceElement) {
          return false;
        }
        let balanceText = balanceElement.textContent.trim();
        if (options.replaceDataArray) {
          options.replaceDataArray.forEach((replaceData) => {
            balanceText = balanceText.replace(
              replaceData.searchValue,
              replaceData.replaceValue
            );
          });
        }
        const removeRegex = options.removeRegex
          ? options.removeRegex
          : defaultRemoveRegex;
        balanceText = balanceText.replace(removeRegex, '');
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
  replaceDataArray?: {
    searchValue: string | RegExp;
    replaceValue: string;
  }[];
  removeRegex?: RegExp;
  context?: () => Document | Element;
}) => (): number => {
  const context = options.context ? options.context() : document;
  const balanceElement = context.querySelector(
    options.balanceSelector
  ) as HTMLElement;
  if (!balanceElement) {
    log('Баланс не найден', 'crimson');
    return 0;
  }
  let balanceText = balanceElement.textContent.trim();
  if (options.replaceDataArray) {
    options.replaceDataArray.forEach((replaceData) => {
      balanceText = balanceText.replace(
        replaceData.searchValue,
        replaceData.replaceValue
      );
    });
  }
  const removeRegex = options.removeRegex
    ? options.removeRegex
    : defaultRemoveRegex;
  balanceText = balanceText.replace(removeRegex, '');
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

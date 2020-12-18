import { log, awaiter } from '@kot-shrodingera-team/germes-utils';

const defaultMinimumStakeRegex = /(\d+(?:\.\d+)?)/;
const defaultRemoveRegex = /[\s,']/g;

export const minimumStakeReadyGenerator = (options: {
  minimumStakeElementSelector: string;
  minimumStakeRegex?: RegExp;
  replaceDataArray?: {
    searchValue: string | RegExp;
    replaceValue: string;
  }[];
  removeRegex?: RegExp;
  context?: () => Document | Element;
}) => async (timeout = 5000, interval = 100): Promise<boolean> => {
  const context = options.context ? options.context() : document;
  const minimumStakeLoaded = Boolean(
    await awaiter(
      () => {
        const minimumStakeElement = context.querySelector(
          options.minimumStakeElementSelector
        );
        if (!minimumStakeElement) {
          return false;
        }
        let minimumStakeText = minimumStakeElement.textContent.trim();
        if (options.replaceDataArray) {
          options.replaceDataArray.forEach((replaceData) => {
            minimumStakeText = minimumStakeText.replace(
              replaceData.searchValue,
              replaceData.replaceValue
            );
          });
        }
        const removeRegex = options.removeRegex
          ? options.removeRegex
          : defaultRemoveRegex;
        minimumStakeText = minimumStakeText.replace(removeRegex, '');
        const minimumStakeRegex = options.minimumStakeRegex
          ? options.minimumStakeRegex
          : defaultMinimumStakeRegex;
        const minimumStakeMatch = minimumStakeText.match(minimumStakeRegex);
        return Boolean(minimumStakeMatch);
      },
      timeout,
      interval
    )
  );
  return minimumStakeLoaded;
};

const getMinimumStakeGenerator = (options: {
  minimumStakeElementSelector: string;
  minimumStakeRegex?: RegExp;
  replaceDataArray?: {
    searchValue: string | RegExp;
    replaceValue: string;
  }[];
  removeRegex?: RegExp;
  context?: () => Document | Element;
  disableLog?: boolean;
}) => (): number => {
  const context = options.context ? options.context() : document;
  const minimumStakeElement = context.querySelector(
    options.minimumStakeElementSelector
  );
  if (!minimumStakeElement) {
    if (options.disableLog !== true) {
      log('Не найдена минимальная сумма ставки', 'crimson');
    }
    return 0;
  }
  let minimumStakeText = minimumStakeElement.textContent.trim();
  if (options.replaceDataArray) {
    options.replaceDataArray.forEach((replaceData) => {
      minimumStakeText = minimumStakeText.replace(
        replaceData.searchValue,
        replaceData.replaceValue
      );
    });
  }
  const removeRegex = options.removeRegex
    ? options.removeRegex
    : defaultRemoveRegex;
  minimumStakeText = minimumStakeText.replace(removeRegex, '');
  const minimumStakeRegex = options.minimumStakeRegex
    ? options.minimumStakeRegex
    : defaultMinimumStakeRegex;
  const minimumStakeMatch = minimumStakeText.match(minimumStakeRegex);
  if (!minimumStakeMatch) {
    if (options.disableLog !== true) {
      log(
        `Непонятный формат маинимальной ставки: "${minimumStakeText}"`,
        'crimson'
      );
    }
    return 0;
  }
  return Number(minimumStakeMatch[1]);
};

export default getMinimumStakeGenerator;

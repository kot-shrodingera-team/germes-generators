import { log, awaiter } from '@kot-shrodingera-team/germes-utils';

const defaultMaximumStakeRegex = /(\d+(?:\.\d+)?)/;
const defaultRemoveRegex = /[\s,']/g;

export const maximumStakeReadyGenerator = (options: {
  maximumStakeElementSelector: string;
  maximumStakeRegex?: RegExp;
  replaceDataArray?: {
    searchValue: string | RegExp;
    replaceValue: string;
  }[];
  removeRegex?: RegExp;
  context?: () => Document | Element;
}) => async (timeout = 5000, interval = 100): Promise<boolean> => {
  const context = options.context ? options.context() : document;
  const maximumStakeLoaded = Boolean(
    await awaiter(
      () => {
        const maximumStakeElement = context.querySelector(
          options.maximumStakeElementSelector
        );
        if (!maximumStakeElement) {
          return false;
        }
        let maximumStakeText = maximumStakeElement.textContent.trim();
        if (options.replaceDataArray) {
          options.replaceDataArray.forEach((replaceData) => {
            maximumStakeText = maximumStakeText.replace(
              replaceData.searchValue,
              replaceData.replaceValue
            );
          });
        }
        const removeRegex = options.removeRegex
          ? options.removeRegex
          : defaultRemoveRegex;
        maximumStakeText = maximumStakeText.replace(removeRegex, '');
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
  replaceDataArray?: {
    searchValue: string | RegExp;
    replaceValue: string;
  }[];
  removeRegex?: RegExp;
  context?: () => Document | Element;
  disableLog?: boolean;
}) => (): number => {
  const context = options.context ? options.context() : document;
  const maximumStakeElement = context.querySelector(
    options.maximumStakeElementSelector
  );
  if (!maximumStakeElement) {
    if (options.disableLog !== true) {
      log('Не найдена максимальная сумма ставки', 'crimson');
    }
    return 0;
  }
  let maximumStakeText = maximumStakeElement.textContent.trim();
  if (options.replaceDataArray) {
    options.replaceDataArray.forEach((replaceData) => {
      maximumStakeText = maximumStakeText.replace(
        replaceData.searchValue,
        replaceData.replaceValue
      );
    });
  }
  const removeRegex = options.removeRegex
    ? options.removeRegex
    : defaultRemoveRegex;
  maximumStakeText = maximumStakeText.replace(removeRegex, '');
  const maximumStakeRegex = options.maximumStakeRegex
    ? options.maximumStakeRegex
    : defaultMaximumStakeRegex;
  const maximumStakeMatch = maximumStakeText.match(maximumStakeRegex);
  if (!maximumStakeMatch) {
    if (options.disableLog !== true) {
      log(
        `Непонятный формат максимальной ставки: "${maximumStakeText}"`,
        'crimson'
      );
    }
    return 0;
  }
  return Number(maximumStakeMatch[1]);
};

export default getMaximumStakeGenerator;

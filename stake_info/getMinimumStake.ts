import { log, awaiter } from '@kot-shrodingera-team/germes-utils';

const defaultMinimumStakeRegex = /(\d+(?:\.\d+)?)/;
const removeRegex = /[\s,']/g;

export const minimumStakeReadyGenerator = (options: {
  minimumStakeElementSelector: string;
  minimumStakeRegex?: RegExp;
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
        const minimumStakeText = minimumStakeElement.textContent
          .trim()
          .replace(removeRegex, '');
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
  context?: () => Document | Element;
}) => (): number => {
  const context = options.context ? options.context() : document;
  const minimumStakeElement = context.querySelector(
    options.minimumStakeElementSelector
  );
  if (!minimumStakeElement) {
    log('Не найдена минимальная сумма ставки', 'crimson');
    return 0;
  }
  const minimumStakeText = minimumStakeElement.textContent
    .trim()
    .replace(removeRegex, '');
  const minimumStakeRegex = options.minimumStakeRegex
    ? options.minimumStakeRegex
    : defaultMinimumStakeRegex;
  const minimumStakeMatch = minimumStakeText.match(minimumStakeRegex);
  if (!minimumStakeMatch) {
    log(
      `Непонятный формат маинимальной ставки: "${minimumStakeText}"`,
      'crimson'
    );
    return 0;
  }
  return Number(minimumStakeMatch[1]);
};

export default getMinimumStakeGenerator;

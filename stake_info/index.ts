import { log, awaiter } from '@kot-shrodingera-team/germes-utils';

export const checkAuthGenerator = (options: {
  accountSelector: string;
}) => (): boolean => {
  const accountMenu = document.querySelector(options.accountSelector);
  return Boolean(accountMenu);
};

export const checkStakeEnabledGenerator = (options: {
  betCheck?: {
    selector: string;
    errorClasses?: {
      className: string;
      message?: string;
    }[];
  };
  errorsCheck?: {
    selector: string;
    message?: string;
  }[];
}) => (): boolean => {
  if (options.betCheck) {
    const betElement = document.querySelector(options.betCheck.selector);
    if (!betElement) {
      log(
        'Ошибка проверки доступности ставки: не найдена ставка в купоне',
        'crimson'
      );
      return false;
    }
    if (options.betCheck.errorClasses.length !== 0) {
      const errorClass = options.betCheck.errorClasses.find(({ className }) => {
        return [...betElement.classList].includes(className);
      });
      if (errorClass) {
        log(
          `Ставка недоступна${
            errorClass.message ? ` (${errorClass.message})` : ''
          }`,
          'crimson'
        );
        return false;
      }
    }
  }
  if (options.errorsCheck.length !== 0) {
    const errorCheck = options.errorsCheck.find(({ selector }) => {
      return Boolean(document.querySelector(selector));
    });
    if (errorCheck) {
      log(
        `Ставка недоступна${
          errorCheck.message ? ` (${errorCheck.message})` : ''
        }`,
        'crimson'
      );
      return false;
    }
  }
  return true;
};

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

export const getCoefficientGenerator = (options: {
  coefficientSelector: string;
}) => (): number => {
  const coefficientElement = document.querySelector(
    options.coefficientSelector
  );
  if (!coefficientElement) {
    log('Коэффициент не найден', 'crimson');
    return 0;
  }
  const coefficientText = coefficientElement.textContent.trim();
  const coefficient = Number(coefficientText);
  if (Number.isNaN(coefficient)) {
    log(`Непонятный формат коэффициента: "${coefficientText}"`, 'crimson');
    return 0;
  }
  return coefficient;
};

export const getCurrentSumGenerator = (options: {
  sumInput: string;
}) => (): number => {
  const sumInput = document.querySelector(options.sumInput) as HTMLInputElement;
  if (!sumInput) {
    log('Не найдено поле ввода суммы ставки', 'crimson');
    return 0;
  }
  const sumText = sumInput.value;
  const sum = Number(sumText);
  if (Number.isNaN(sum)) {
    log(`Непонятный формат текущей суммы ставки: "${sumText}"`, 'crimson');
    return 0;
  }
  return sum;
};

export const getMaximumStakeGenerator = (options: {
  maximumStakeElementSelector: string;
}) => (): number => {
  const maximumStakeElement = document.querySelector(
    options.maximumStakeElementSelector
  );
  if (!maximumStakeElement) {
    log('Не найдена максимальная сумма ставки', 'crimson');
    return 0;
  }
  const maximumStakeText = maximumStakeElement.textContent.trim();
  const maximumStake = Number(maximumStakeText);
  if (Number.isNaN(maximumStake)) {
    log(
      `Непонятный формат максимальной ставки: "${maximumStakeText}"`,
      'crimson'
    );
    return 0;
  }
  return maximumStake;
};

export const getMinimumStakeGenerator = (options: {
  minimumStakeElementSelector: string;
}) => (): number => {
  const minimumStakeElement = document.querySelector(
    options.minimumStakeElementSelector
  );
  if (!minimumStakeElement) {
    log('Не найдена минимальная сумма ставки', 'crimson');
    return 0;
  }
  const minimumStakeText = minimumStakeElement.textContent.trim();
  const minimumStake = Number(minimumStakeText);
  if (Number.isNaN(minimumStake)) {
    log(
      `Непонятный формат минимальной ставки: "${minimumStakeText}"`,
      'crimson'
    );
    return 0;
  }
  return minimumStake;
};

export const getStakeCountGenerator = (options: {
  stakeElementSelector: string;
}) => (): number => {
  return document.querySelectorAll(options.stakeElementSelector).length;
};

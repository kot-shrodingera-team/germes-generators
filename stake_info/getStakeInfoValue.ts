import {
  awaiter,
  getWorkerParameter,
  log,
  text,
} from '@kot-shrodingera-team/germes-utils';
import { defaultNumberRegex, defaultRemoveRegex } from './defaultRegexes';
import { StakeInfoValueOptions } from './types';

const getStakeInfoValueGenerator = (
  options: StakeInfoValueOptions
) => (): number => {
  if (options.name === 'balance') {
    if (
      getWorkerParameter('fakeBalance', 'number') ||
      getWorkerParameter('fakeAuth')
    ) {
      const fakeBalance = getWorkerParameter<number>('fakeBalance', 'number');
      if (fakeBalance !== undefined) {
        return fakeBalance;
      }
      return 100000;
    }
  } else if (options.name === 'coefficient') {
    if (
      getWorkerParameter('fakeCoefficient') ||
      getWorkerParameter('fakeOpenStake')
    ) {
      const coefficient = Number(JSON.parse(worker.ForkObj).coefficient);
      if (Number.isNaN(coefficient)) {
        return 0;
      }
      return coefficient;
    }
  } else if (options.name === 'currentSum') {
    if (
      getWorkerParameter('fakeCurrentSum', 'number') ||
      getWorkerParameter('fakeOpenStake')
    ) {
      const fakeCurrentSum = getWorkerParameter<number>(
        'fakeCurrentSum',
        'number'
      );
      if (fakeCurrentSum !== undefined) {
        return fakeCurrentSum;
      }
      return 0;
    }
  } else if (options.name === 'maximumStake') {
    if (
      getWorkerParameter('fakeMaximumStake', 'number') ||
      getWorkerParameter('fakeAuth') ||
      getWorkerParameter('fakeOpenStake')
    ) {
      const fakeMaximumStake = getWorkerParameter<number>(
        'fakeMaximumStake',
        'number'
      );
      if (fakeMaximumStake !== undefined) {
        return fakeMaximumStake;
      }
      return 100000;
    }
    if (window.germesData.maximumStake !== undefined) {
      return window.germesData.maximumStake;
    }
  } else if (options.name === 'minimumStake') {
    if (
      getWorkerParameter('fakeMinimumStake', 'number') ||
      getWorkerParameter('fakeAuth') ||
      getWorkerParameter('fakeOpenStake')
    ) {
      const fakeMinimumStake = getWorkerParameter<number>(
        'fakeMinimumStake',
        'number'
      );
      if (fakeMinimumStake !== undefined) {
        return fakeMinimumStake;
      }
      return 100000;
    }
    if (window.germesData.minimumStake !== undefined) {
      return window.germesData.minimumStake;
    }
  }
  let preliminaryValue = 0;
  let extractType = '';
  if ('fixedValue' in options) {
    preliminaryValue = options.fixedValue();
    extractType = 'fixed';
  } else {
    const valueFromTextOptions = options.valueFromText;
    let valueText = '';
    if ('getText' in valueFromTextOptions.text) {
      valueText = valueFromTextOptions.text.getText();
    } else {
      const context = valueFromTextOptions.text.context
        ? valueFromTextOptions.text.context()
        : document;
      const valueElement = context.querySelector(
        valueFromTextOptions.text.selector
      );
      if (!valueElement) {
        if (options.disableLog !== true) {
          log(`Не найден элемент ${options.name}`, 'crimson');
        }
        return valueFromTextOptions.errorValue;
      }
      valueText = text(valueElement);
    }
    if (valueFromTextOptions.replaceDataArray) {
      valueFromTextOptions.replaceDataArray.forEach((replaceData) => {
        valueText = valueText.replace(
          replaceData.searchValue,
          replaceData.replaceValue
        );
      });
    }
    const removeRegex = valueFromTextOptions.removeRegex
      ? valueFromTextOptions.removeRegex
      : defaultRemoveRegex;
    valueText = valueText.replace(removeRegex, '');
    if (!options.zeroValues || !options.zeroValues.includes(valueText)) {
      const matchRegex = valueFromTextOptions.matchRegex
        ? valueFromTextOptions.matchRegex
        : defaultNumberRegex;
      const minimumStakeMatch = valueText.match(matchRegex);
      if (!minimumStakeMatch) {
        if (options.disableLog !== true) {
          log(
            `Непонятный формат элемента ${options.name}: "${valueText}"`,
            'crimson'
          );
        }
        return valueFromTextOptions.errorValue;
      }
      preliminaryValue = Number(minimumStakeMatch[1]);
    }
    extractType = 'text';
  }
  if (options.modifyValue) {
    return options.modifyValue(preliminaryValue, extractType);
  }
  return preliminaryValue;
};

export const stakeInfoValueReadyGenerator = (
  options: StakeInfoValueOptions
) => async (timeout = 5000, interval = 100): Promise<boolean> => {
  const modifiedOptions = { ...options, disableLog: true };
  const modifiedGetStakeInfoValue = getStakeInfoValueGenerator(modifiedOptions);
  const valueLoaded = await awaiter(
    () => {
      return modifiedGetStakeInfoValue() !== null;
    },
    timeout,
    interval
  );
  return Boolean(valueLoaded);
};

export default getStakeInfoValueGenerator;

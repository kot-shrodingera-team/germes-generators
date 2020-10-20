import { log } from '@kot-shrodingera-team/germes-utils';

const checkStakeEnabledGenerator = (options: {
  preCheck?: () => boolean;
  getStakeCount: () => number;
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
  context?: Document | Element;
}) => (): boolean => {
  const context = options.context ? options.context : document;
  if (options.preCheck && !options.preCheck()) {
    return false;
  }
  const stakeCount = options.getStakeCount();
  if (stakeCount !== 1) {
    log(
      `Ошибка проверки доступности ставки: в купоне не 1 ставка (${stakeCount})`,
      'crimson'
    );
    return false;
  }
  if (options.betCheck) {
    const betElement = context.querySelector(options.betCheck.selector);
    if (!betElement) {
      log(
        'Ошибка проверки доступности ставки: не найдена ставка в купоне',
        'crimson'
      );
      return false;
    }
    if (options.betCheck.errorClasses) {
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
  if (options.errorsCheck) {
    const errorCheck = options.errorsCheck.find(({ selector }) => {
      return Boolean(context.querySelector(selector));
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

export default checkStakeEnabledGenerator;

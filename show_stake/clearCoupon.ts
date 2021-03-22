import { log, awaiter } from '@kot-shrodingera-team/germes-utils';

const clearCouponGenerator = (options: {
  preCheck?: () => Promise<boolean>;
  getStakeCount: () => number;
  apiClear?: () => void;
  clearSingleSelector?: string;
  clearAllSelector?: string;
  postCheck?: () => Promise<boolean>;
  maxUnload?: {
    getMaximumStake: () => number;
  };
  context?: () => Document | Element;
}) => async (): Promise<boolean> => {
  if (
    !options.apiClear &&
    !options.clearSingleSelector &&
    !options.clearAllSelector
  ) {
    log('Ошибка функции очистки купона. Обратитесь в ТП', 'crimson');
    return false;
  }
  if (options.preCheck) {
    const result = await options.preCheck();
    if (!result) {
      return false;
    }
  }
  const context = options.context ? options.context() : document;
  const stakeCount = options.getStakeCount();
  if (stakeCount !== 0) {
    log('Купон не пуст. Очищаем', 'orange');
    if (options.apiClear) {
      options.apiClear();
    } else if (stakeCount === 1) {
      if (options.clearSingleSelector) {
        const clearSingleButton = context.querySelector(
          options.clearSingleSelector
        ) as HTMLElement;
        if (!clearSingleButton) {
          log('Не найдена кнопка удаления ставки из купона', 'crimson');
          return false;
        }
        clearSingleButton.click();
      } else {
        const clearAllButton = context.querySelector(
          options.clearAllSelector
        ) as HTMLElement;
        if (!clearAllButton) {
          log('Не найдена кнопка очистки купона', 'crimson');
          return false;
        }
        clearAllButton.click();
      }
    } else if (options.clearAllSelector) {
      const clearAllButton = context.querySelector(
        options.clearAllSelector
      ) as HTMLElement;
      if (!clearAllButton) {
        log('Не найдена кнопка очистки купона', 'crimson');
        return false;
      }
      clearAllButton.click();
    } else {
      const clearSingleButtons = [
        ...context.querySelectorAll(options.clearSingleSelector),
      ] as HTMLElement[];
      if (clearSingleButtons.length === 0) {
        log('Не найдены кнопки удаления ставок из купона', 'crimson');
        return false;
      }
      clearSingleButtons.forEach((button) => button.click());
    }

    const couponCleared = Boolean(
      await awaiter(() => options.getStakeCount() === 0)
    );
    if (!couponCleared) {
      log('Не удалось очистить купон', 'crimson');
      return false;
    }
    log('Купон очищен', 'steelblue');
    if (options.postCheck) {
      const result = await options.postCheck();
      if (!result) {
        return false;
      }
    }
  }
  log('Купон пуст', 'steelblue');
  return true;
};

export default clearCouponGenerator;
